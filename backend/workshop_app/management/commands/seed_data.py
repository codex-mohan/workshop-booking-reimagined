import random
from datetime import timedelta

from django.contrib.auth.models import Group, User
from django.core.management.base import BaseCommand
from django.utils import timezone

from workshop_app.models import (
    Comment,
    Profile,
    Workshop,
    WorkshopType,
    department_choices,
    states,
)

COORDINATORS = [
    {
        "first_name": "Arun",
        "last_name": "Sharma",
        "institute": "VJTI Mumbai",
        "department": "computer engineering",
        "state": "IN-MH",
        "phone_number": "9876543201",
    },
    {
        "first_name": "Priya",
        "last_name": "Ramanathan",
        "institute": "IIIT Hyderabad",
        "department": "computer engineering",
        "state": "IN-TG",
        "phone_number": "9876543202",
    },
    {
        "first_name": "Vikram",
        "last_name": "Patel",
        "institute": "NIT Trichy",
        "department": "electronics",
        "state": "IN-TN",
        "phone_number": "9876543203",
    },
    {
        "first_name": "Sneha",
        "last_name": "Kulkarni",
        "institute": "BITS Pilani",
        "department": "computer engineering",
        "state": "IN-RJ",
        "phone_number": "9876543204",
    },
    {
        "first_name": "Rajesh",
        "last_name": "Kumar",
        "institute": "DTU Delhi",
        "department": "information technology",
        "state": "IN-DL",
        "phone_number": "9876543205",
    },
    {
        "first_name": "Ananya",
        "last_name": "Mukherjee",
        "institute": "Jadavpur University",
        "department": "computer engineering",
        "state": "IN-WB",
        "phone_number": "9876543206",
    },
    {
        "first_name": "Suresh",
        "last_name": "Nair",
        "institute": "NIT Calicut",
        "department": "mechanical engineering",
        "state": "IN-KL",
        "phone_number": "9876543207",
    },
    {
        "first_name": "Meera",
        "last_name": "Iyer",
        "institute": "IISc Bangalore",
        "department": "aerospace engineering",
        "state": "IN-KA",
        "phone_number": "9876543208",
    },
    {
        "first_name": "Amit",
        "last_name": "Singh",
        "institute": "IIT Kanpur",
        "department": "electrical engineering",
        "state": "IN-UP",
        "phone_number": "9876543209",
    },
    {
        "first_name": "Pooja",
        "last_name": "Verma",
        "institute": "MNIT Jaipur",
        "department": "information technology",
        "state": "IN-RJ",
        "phone_number": "9876543210",
    },
    {
        "first_name": "Ravi",
        "last_name": "Desai",
        "institute": "COEP Pune",
        "department": "mechanical engineering",
        "state": "IN-MH",
        "phone_number": "9876543211",
    },
    {
        "first_name": "Deepa",
        "last_name": "Krishnan",
        "institute": "Anna University Chennai",
        "department": "computer engineering",
        "state": "IN-TN",
        "phone_number": "9876543212",
    },
    {
        "first_name": "Sanjay",
        "last_name": "Gupta",
        "institute": "NIT Surathkal",
        "department": "chemical engineering",
        "state": "IN-KA",
        "phone_number": "9876543213",
    },
    {
        "first_name": "Nisha",
        "last_name": "Joshi",
        "institute": "IIT Roorkee",
        "department": "civil engineering",
        "state": "IN-UT",
        "phone_number": "9876543214",
    },
    {
        "first_name": "Manoj",
        "last_name": "Reddy",
        "institute": "IIIT Bangalore",
        "department": "information technology",
        "state": "IN-KA",
        "phone_number": "9876543215",
    },
]

INSTRUCTORS = [
    {
        "username": "instructor1",
        "first_name": "Raghav",
        "last_name": "Iyer",
        "email": "raghav.iyer@fossee.in",
        "phone_number": "9812345601",
    },
    {
        "username": "instructor2",
        "first_name": "Kavita",
        "last_name": "Deshmukh",
        "email": "kavita.deshmukh@fossee.in",
        "phone_number": "9812345602",
    },
    {
        "username": "instructor3",
        "first_name": "Siddharth",
        "last_name": "Pillai",
        "email": "siddharth.pillai@fossee.in",
        "phone_number": "9812345603",
    },
]

COMMENT_TEXTS = [
    "Can we change the date to next week?",
    "Please ensure Python 3.x is installed on all machines.",
    "Lab has 40 machines with Ubuntu 20.04.",
    "We have 50 participants confirmed so far.",
    "Is it possible to extend the workshop by half a day?",
    "The lab has projectors and whiteboards available.",
    "Can we cover NumPy and Pandas as well?",
    "Internet connectivity is limited in the lab. Is offline setup possible?",
    "We need a custom module on data visualization added to the schedule.",
    "The workshop was very well conducted. Thank you!",
    "Participants found the hands-on sessions very useful.",
    "Can we schedule a follow-up advanced workshop?",
    "Some machines have older hardware. Will that be an issue?",
    "Parking is available near Block B for the instructor.",
    "Please share the pre-requisite material a week in advance.",
    "We had 35 attendees, more than expected. Great turnout!",
    "The coordinator has confirmed all logistics are in place.",
    "Can the instructor arrive a day early for setup?",
    "Lunch arrangements have been made at the campus canteen.",
    "We need to reschedule due to an exam clash.",
]


class Command(BaseCommand):
    help = "Seed realistic workshop data for development"

    def handle(self, *args, **options):
        self.stdout.write("Seeding workshop data...\n")

        self._create_workshop_types()
        coordinator_users = self._create_coordinators()
        instructor_users = self._create_instructors()
        workshops = self._create_workshops(coordinator_users, instructor_users)
        self._create_comments(coordinator_users, instructor_users, workshops)

        self.stdout.write(self.style.SUCCESS("\nAll data seeded successfully!"))

    def _create_workshop_types(self):
        self.stdout.write("\n--- Workshop Types ---")
        types_data = [
            {
                "name": "Python Workshop",
                "description": "A comprehensive introduction to Python programming covering basics, data structures, functions, and libraries like NumPy and Matplotlib.",
                "duration": 2,
                "terms_and_conditions": "1. The institution must provide a computer lab with Python 3.x installed.\n2. Minimum 30 participants required.\n3. Projector and internet connectivity must be available.\n4. The coordinator must ensure attendance for the full duration.",
            },
            {
                "name": "Scilab Workshop",
                "description": "Hands-on workshop on Scilab for numerical computation, simulation, and engineering applications.",
                "duration": 2,
                "terms_and_conditions": "1. Scilab must be installed on all lab machines.\n2. Minimum 30 participants required.\n3. Projector and internet connectivity must be available.\n4. The coordinator must ensure attendance for the full duration.",
            },
            {
                "name": "OpenFOAM Workshop",
                "description": "Introduction to OpenFOAM for computational fluid dynamics simulations, covering mesh generation, case setup, and post-processing.",
                "duration": 2,
                "terms_and_conditions": "1. OpenFOAM must be installed on all lab machines.\n2. Minimum 25 participants required.\n3. Linux-based systems preferred.\n4. Projector and internet connectivity must be available.",
            },
            {
                "name": "eSim Workshop",
                "description": "Workshop on eSim for electronic circuit simulation and PCB design, covering schematic capture, simulation, and layout.",
                "duration": 1,
                "terms_and_conditions": "1. eSim must be installed on all lab machines.\n2. Minimum 30 participants required.\n3. Projector and internet connectivity must be available.\n4. The coordinator must ensure attendance for the full duration.",
            },
            {
                "name": "R Workshop",
                "description": "Introduction to R programming for statistical computing and graphics, covering data analysis, visualization, and reporting.",
                "duration": 2,
                "terms_and_conditions": "1. R and RStudio must be installed on all lab machines.\n2. Minimum 30 participants required.\n3. Projector and internet connectivity must be available.\n4. The coordinator must ensure attendance for the full duration.",
            },
            {
                "name": "OpenModelica Workshop",
                "description": "Workshop on OpenModelica for modeling and simulation of dynamic systems using the Modelica language.",
                "duration": 2,
                "terms_and_conditions": "1. OpenModelica must be installed on all lab machines.\n2. Minimum 25 participants required.\n3. Projector and internet connectivity must be available.\n4. The coordinator must ensure attendance for the full duration.",
            },
        ]
        created_count = 0
        for wt_data in types_data:
            obj, created = WorkshopType.objects.get_or_create(
                name=wt_data["name"], defaults=wt_data
            )
            if created:
                created_count += 1
                self.stdout.write(self.style.SUCCESS(f"  Created: {wt_data['name']}"))
            else:
                self.stdout.write(f"  Exists: {wt_data['name']}")
        self.stdout.write(f"  Workshop types: {created_count} created")

    def _create_coordinators(self):
        self.stdout.write("\n--- Coordinators ---")
        users = []
        for coord in COORDINATORS:
            username = f"{coord['first_name'].lower()}.{coord['last_name'].lower()}"
            email = f"{username}@{coord['institute'].lower().replace(' ', '').replace('.', '')}.ac.in"
            user, created = User.objects.get_or_create(
                username=username,
                defaults={
                    "first_name": coord["first_name"],
                    "last_name": coord["last_name"],
                    "email": email,
                },
            )
            if created:
                user.set_password("fossee123")
                user.save()
                Profile.objects.create(
                    user=user,
                    institute=coord["institute"],
                    department=coord["department"],
                    state=coord["state"],
                    phone_number=coord["phone_number"],
                    position="coordinator",
                    is_email_verified=True,
                )
                self.stdout.write(
                    self.style.SUCCESS(f"  Created: {username} ({coord['institute']})")
                )
            else:
                self.stdout.write(f"  Exists: {username}")
            users.append(user)
        self.stdout.write(f"  Coordinators: {len(users)} total")
        return users

    def _create_instructors(self):
        self.stdout.write("\n--- Instructors ---")
        instructor_group, _ = Group.objects.get_or_create(name="instructor")
        users = []
        for inst in INSTRUCTORS:
            user, created = User.objects.get_or_create(
                username=inst["username"],
                defaults={
                    "first_name": inst["first_name"],
                    "last_name": inst["last_name"],
                    "email": inst["email"],
                },
            )
            if created:
                user.set_password("fossee123")
                user.save()
                Profile.objects.create(
                    user=user,
                    institute="IIT Bombay",
                    department="computer engineering",
                    state="IN-MH",
                    phone_number=inst["phone_number"],
                    position="instructor",
                    is_email_verified=True,
                )
                self.stdout.write(
                    self.style.SUCCESS(
                        f"  Created: {inst['username']} ({inst['first_name']} {inst['last_name']})"
                    )
                )
            else:
                self.stdout.write(f"  Exists: {inst['username']}")

            user.groups.add(instructor_group)
            users.append(user)
        self.stdout.write(f"  Instructors: {len(users)} total")
        return users

    def _create_workshops(self, coordinator_users, instructor_users):
        self.stdout.write("\n--- Workshops ---")
        workshop_types = list(WorkshopType.objects.all())
        if not workshop_types:
            self.stdout.write(self.style.ERROR("  No workshop types found!"))
            return []

        now = timezone.now()
        six_months_ago = now - timedelta(days=180)
        three_months_ahead = now + timedelta(days=90)

        workshop_configs = [
            {"status": 1, "count": 24},
            {"status": 0, "count": 10},
            {"status": 2, "count": 6},
        ]

        workshops = []
        created_count = 0
        for config in workshop_configs:
            status = config["status"]
            for i in range(config["count"]):
                if status == 1:
                    date = six_months_ago + timedelta(
                        days=random.randint(0, (now - six_months_ago).days - 1)
                    )
                elif status == 0:
                    date = now + timedelta(
                        days=random.randint(1, (three_months_ahead - now).days)
                    )
                else:
                    date = six_months_ago + timedelta(
                        days=random.randint(
                            0, (three_months_ahead - six_months_ago).days
                        )
                    )

                coordinator = random.choice(coordinator_users)
                instructor = random.choice(instructor_users)
                workshop_type = random.choice(workshop_types)

                workshop, created = Workshop.objects.get_or_create(
                    coordinator=coordinator,
                    workshop_type=workshop_type,
                    date=date,
                    defaults={
                        "instructor": instructor,
                        "status": status,
                        "tnc_accepted": True,
                    },
                )
                if created:
                    created_count += 1
                    workshops.append(workshop)

        random.shuffle(workshops)
        self.stdout.write(f"  Workshops: {created_count} created")
        return workshops

    def _create_comments(self, coordinator_users, instructor_users, workshops):
        self.stdout.write("\n--- Comments ---")
        if not workshops:
            self.stdout.write("  No workshops to comment on.")
            return

        all_users = coordinator_users + instructor_users
        created_count = 0
        for i in range(20):
            workshop = random.choice(workshops)
            author = random.choice(all_users)
            text = COMMENT_TEXTS[i]
            is_public = random.choice([True, True, True, False])

            comment, created = Comment.objects.get_or_create(
                author=author,
                workshop=workshop,
                comment=text,
                defaults={"public": is_public},
            )
            if created:
                created_count += 1
                visibility = "public" if is_public else "private"
                self.stdout.write(
                    self.style.SUCCESS(
                        f"  Created: {visibility} comment by {author.username} on {workshop}"
                    )
                )

        self.stdout.write(f"  Comments: {created_count} created")
