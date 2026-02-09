from django.core.management.base import BaseCommand
from applications.models import Image, Application
from PIL import Image as PilImage
from io import BytesIO
from django.core.files.base import ContentFile
import os

class Command(BaseCommand):
    help = "Convert all existing images to WEBP format"

    def handle(self, *args, **kwargs):
        self.convert_result_images()
        self.convert_application_images()
        self.stdout.write(self.style.SUCCESS("All images converted to WEBP"))

    def convert_result_images(self):
        images = Image.objects.exclude(image__iendswith=".webp")

        for obj in images:
            self.convert(obj, field_name="image")

    def convert_application_images(self):
        apps = Application.objects.exclude(image__iendswith=".webp").exclude(image="")

        for obj in apps:
            self.convert(obj, field_name="image")

    def convert(self, obj, field_name):
        field = getattr(obj, field_name)

        try:
            img = PilImage.open(field)

            if img.mode in ("RGBA", "P"):
                img = img.convert("RGB")

            buffer = BytesIO()
            img.save(buffer, format="WEBP", quality=80)

            old_name = field.name
            new_name = os.path.splitext(old_name)[0] + ".webp"

            field.save(new_name, ContentFile(buffer.getvalue()), save=False)
            obj.save()

            field.storage.delete(old_name)

            self.stdout.write(f"Converted: {old_name}")

        except Exception as e:
            self.stderr.write(f"Error with {field.name}: {e}")
