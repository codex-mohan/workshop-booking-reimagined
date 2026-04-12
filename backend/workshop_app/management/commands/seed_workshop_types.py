from django.core.management.base import BaseCommand
from workshop_app.models import WorkshopType


class Command(BaseCommand):
    help = "Seed workshop types for development"

    def handle(self, *args, **options):
        types = [
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
        for wt_data in types:
            obj, created = WorkshopType.objects.get_or_create(
                name=wt_data["name"],
                defaults=wt_data,
            )
            if created:
                created_count += 1
                self.stdout.write(self.style.SUCCESS(f"  Created: {wt_data['name']}"))
            else:
                self.stdout.write(f"  Exists: {wt_data['name']}")

        self.stdout.write(
            self.style.SUCCESS(f"\nDone. {created_count} workshop types created.")
        )
