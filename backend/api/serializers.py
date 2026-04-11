from rest_framework import serializers
from django.contrib.auth.models import User
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


class ProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = Profile
        fields = [
            "id",
            "title",
            "institute",
            "department",
            "phone_number",
            "position",
            "location",
            "state",
            "is_email_verified",
        ]
        read_only_fields = ["is_email_verified"]


class UserSerializer(serializers.ModelSerializer):
    profile = ProfileSerializer(read_only=True)
    full_name = serializers.CharField(source="get_full_name", read_only=True)

    class Meta:
        model = User
        fields = [
            "id",
            "username",
            "email",
            "first_name",
            "last_name",
            "full_name",
            "profile",
        ]


class WorkshopTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = WorkshopType
        fields = ["id", "name", "description", "duration", "terms_and_conditions"]


class WorkshopListSerializer(serializers.ModelSerializer):
    coordinator_name = serializers.CharField(
        source="coordinator.get_full_name", read_only=True
    )
    coordinator_institute = serializers.CharField(
        source="coordinator.profile.institute", read_only=True
    )
    instructor_name = serializers.CharField(
        source="instructor.get_full_name", read_only=True, default=""
    )
    workshop_type_name = serializers.CharField(
        source="workshop_type.name", read_only=True
    )
    status_display = serializers.CharField(source="get_status", read_only=True)

    class Meta:
        model = Workshop
        fields = [
            "id",
            "uid",
            "coordinator",
            "coordinator_name",
            "coordinator_institute",
            "instructor",
            "instructor_name",
            "workshop_type",
            "workshop_type_name",
            "date",
            "status",
            "status_display",
            "tnc_accepted",
        ]


class CommentSerializer(serializers.ModelSerializer):
    author_name = serializers.CharField(source="author.get_full_name", read_only=True)

    class Meta:
        model = Comment
        fields = [
            "id",
            "author",
            "author_name",
            "comment",
            "public",
            "created_date",
        ]
        read_only_fields = ["author", "created_date"]


class RegisterSerializer(serializers.Serializer):
    username = serializers.CharField(max_length=32)
    email = serializers.EmailField()
    password = serializers.CharField(max_length=128, write_only=True)
    confirm_password = serializers.CharField(max_length=128, write_only=True)
    title = serializers.ChoiceField(choices=title)
    first_name = serializers.CharField(max_length=32)
    last_name = serializers.CharField(max_length=32)
    phone_number = serializers.CharField(max_length=10)
    institute = serializers.CharField(max_length=128)
    department = serializers.ChoiceField(choices=department_choices)
    location = serializers.CharField(max_length=255, required=False, default="")
    state = serializers.ChoiceField(choices=states)
    how_did_you_hear_about_us = serializers.ChoiceField(
        choices=source, required=False, default=""
    )

    def validate(self, data):
        if data["password"] != data["confirm_password"]:
            raise serializers.ValidationError("Passwords do not match")
        if User.objects.filter(username=data["username"]).exists():
            raise serializers.ValidationError("Username already exists")
        if User.objects.filter(email=data["email"]).exists():
            raise serializers.ValidationError("Email already exists")
        return data
