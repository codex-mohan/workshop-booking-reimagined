import datetime as dt

from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.models import User
from django.utils import timezone
from django.db.models import Q
from rest_framework import generics, status, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from workshop_app.models import (
    Profile,
    Workshop,
    WorkshopType,
    Comment,
    states,
    position_choices,
    department_choices,
    title,
    source,
)
from workshop_app.send_mails import generate_activation_key, send_email

from .serializers import (
    UserSerializer,
    ProfileSerializer,
    WorkshopTypeSerializer,
    WorkshopListSerializer,
    CommentSerializer,
    RegisterSerializer,
)


class CurrentUserView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        serializer = UserSerializer(request.user)
        is_instructor = request.user.groups.filter(name="instructor").exists()
        data = serializer.data
        data["is_instructor"] = is_instructor
        return Response(data)


class RegisterView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        data = serializer.validated_data
        new_user = User.objects.create_user(
            data["username"].lower(), data["email"], data["password"]
        )
        new_user.first_name = data["first_name"]
        new_user.last_name = data["last_name"]
        new_user.save()

        profile = Profile(user=new_user)
        profile.institute = data["institute"]
        profile.department = data["department"]
        profile.phone_number = data["phone_number"]
        profile.location = data.get("location", "")
        profile.title = data["title"]
        profile.state = data["state"]
        profile.how_did_you_hear_about_us = data.get("how_did_you_hear_about_us", "")
        profile.activation_key = generate_activation_key(new_user.username)
        profile.key_expiry_time = timezone.now() + timezone.timedelta(days=1)
        profile.save()

        login(request, new_user)
        return Response(
            {"message": "Registration successful.", "user_id": new_user.id},
            status=status.HTTP_201_CREATED,
        )


class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        username = request.data.get("username")
        password = request.data.get("password")
        user = authenticate(request, username=username, password=password)

        if not user:
            return Response(
                {"detail": "Invalid username or password"},
                status=status.HTTP_401_UNAUTHORIZED,
            )

        if not user.profile.is_email_verified:
            return Response(
                {"detail": "Email not verified.", "needs_activation": True},
                status=status.HTTP_403_FORBIDDEN,
            )

        login(request, user)
        serializer = UserSerializer(user)
        is_instructor = user.groups.filter(name="instructor").exists()
        data = serializer.data
        data["is_instructor"] = is_instructor
        return Response(data)


class LogoutView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        logout(request)
        return Response({"message": "Logged out"})


class WorkshopTypeListView(generics.ListAPIView):
    serializer_class = WorkshopTypeSerializer
    permission_classes = [AllowAny]
    queryset = WorkshopType.objects.all().order_by("id")


class WorkshopTypeDetailView(generics.RetrieveAPIView):
    queryset = WorkshopType.objects.all()
    serializer_class = WorkshopTypeSerializer
    permission_classes = [AllowAny]


class CoordinatorWorkshopListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if request.user.groups.filter(name="instructor").exists():
            return Response({"detail": "Not a coordinator"}, status=403)
        workshops = Workshop.objects.filter(coordinator=request.user).order_by("-date")
        serializer = WorkshopListSerializer(workshops, many=True)
        return Response(serializer.data)


class InstructorWorkshopListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if not request.user.groups.filter(name="instructor").exists():
            return Response({"detail": "Not an instructor"}, status=403)
        today = timezone.now().date()
        workshops = Workshop.objects.filter(
            Q(instructor=request.user, date__gte=today) | Q(status=0)
        ).order_by("-date")
        serializer = WorkshopListSerializer(workshops, many=True)
        return Response(serializer.data)


class ProposeWorkshopView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        if request.user.groups.filter(name="instructor").exists():
            return Response(
                {"detail": "Instructors cannot propose workshops"}, status=403
            )

        workshop_type_id = request.data.get("workshop_type")
        date = request.data.get("date")
        tnc_accepted = request.data.get("tnc_accepted", False)

        if not workshop_type_id or not date or not tnc_accepted:
            return Response(
                {"detail": "Workshop type, date, and T&C acceptance are required"},
                status=400,
            )

        try:
            wt = WorkshopType.objects.get(pk=workshop_type_id)
        except WorkshopType.DoesNotExist:
            return Response({"detail": "Workshop type not found"}, status=404)

        workshop = Workshop.objects.create(
            coordinator=request.user,
            workshop_type=wt,
            date=date,
            tnc_accepted=True,
        )
        return Response(
            WorkshopListSerializer(workshop).data,
            status=status.HTTP_201_CREATED,
        )


class AcceptWorkshopView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        if not request.user.groups.filter(name="instructor").exists():
            return Response({"detail": "Not an instructor"}, status=403)
        try:
            workshop = Workshop.objects.get(pk=pk)
        except Workshop.DoesNotExist:
            return Response({"detail": "Not found"}, status=404)

        workshop.status = 1
        workshop.instructor = request.user
        workshop.save()
        return Response(WorkshopListSerializer(workshop).data)


class ChangeWorkshopDateView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        if not request.user.groups.filter(name="instructor").exists():
            return Response({"detail": "Not an instructor"}, status=403)

        new_date = request.data.get("new_date")
        if not new_date:
            return Response({"detail": "new_date is required"}, status=400)

        try:
            workshop = Workshop.objects.get(pk=pk)
        except Workshop.DoesNotExist:
            return Response({"detail": "Not found"}, status=404)

        workshop.date = new_date
        workshop.save()
        return Response(WorkshopListSerializer(workshop).data)


class WorkshopDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        try:
            workshop = Workshop.objects.get(pk=pk)
        except Workshop.DoesNotExist:
            return Response({"detail": "Not found"}, status=404)

        is_instructor = request.user.groups.filter(name="instructor").exists()
        comments = Comment.objects.filter(workshop=workshop)
        if not is_instructor:
            comments = comments.filter(public=True)

        return Response(
            {
                "workshop": WorkshopListSerializer(workshop).data,
                "comments": CommentSerializer(comments, many=True).data,
            }
        )


class CommentCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, workshop_id):
        try:
            workshop = Workshop.objects.get(pk=workshop_id)
        except Workshop.DoesNotExist:
            return Response({"detail": "Not found"}, status=404)

        is_instructor = request.user.groups.filter(name="instructor").exists()
        comment = Comment.objects.create(
            author=request.user,
            comment=request.data.get("comment", ""),
            public=request.data.get("public", True) if is_instructor else True,
            workshop=workshop,
        )
        return Response(CommentSerializer(comment).data, status=201)


class ProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response(UserSerializer(request.user).data)

    def put(self, request):
        user = request.user
        user.first_name = request.data.get("first_name", user.first_name)
        user.last_name = request.data.get("last_name", user.last_name)
        user.save()

        profile = user.profile
        for field in [
            "title",
            "institute",
            "department",
            "phone_number",
            "position",
            "location",
            "state",
        ]:
            if field in request.data:
                setattr(profile, field, request.data[field])
        profile.save()

        return Response(UserSerializer(user).data)


class PublicStatisticsView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        today = timezone.now()
        upto = today + dt.timedelta(days=15)
        workshops = Workshop.objects.filter(
            date__range=(today, upto), status=1
        ).order_by("date")

        from_date = request.query_params.get("from_date")
        to_date = request.query_params.get("to_date")
        state = request.query_params.get("state")
        workshop_type = request.query_params.get("workshop_type")

        if from_date and to_date:
            workshops = Workshop.objects.filter(
                date__range=(from_date, to_date), status=1
            ).order_by("date")
            if state:
                workshops = workshops.filter(coordinator__profile__state=state)
            if workshop_type:
                workshops = workshops.filter(workshop_type_id=workshop_type)

        ws_states, ws_count = Workshop.objects.get_workshops_by_state(workshops)
        ws_type, ws_type_count = Workshop.objects.get_workshops_by_type(workshops)

        page = int(request.query_params.get("page", 1))
        per_page = 30
        total = workshops.count()
        start = (page - 1) * per_page
        end = start + per_page
        paginated = workshops[start:end]

        return Response(
            {
                "workshops": WorkshopListSerializer(paginated, many=True).data,
                "total": total,
                "page": page,
                "total_pages": (total + per_page - 1) // per_page,
                "state_chart": {"labels": ws_states, "data": ws_count},
                "type_chart": {"labels": ws_type, "data": ws_type_count},
            }
        )


class FilterOptionsView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        return Response(
            {
                "states": [{"value": v, "label": l} for v, l in states if v],
                "positions": [{"value": v, "label": l} for v, l in position_choices],
                "departments": [
                    {"value": v, "label": l} for v, l in department_choices
                ],
                "titles": [{"value": v, "label": l} for v, l in title],
                "sources": [{"value": v, "label": l} for v, l in source],
                "workshop_types": WorkshopTypeSerializer(
                    WorkshopType.objects.all(), many=True
                ).data,
            }
        )
