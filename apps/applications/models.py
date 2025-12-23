from django.core.validators import FileExtensionValidator
from django.db.models import CharField, Model, ImageField, ForeignKey, CASCADE, TextField, DateTimeField, TextChoices
from django.db.models.fields import DecimalField


# Create your models here.

class CreatedBaseModel(Model):
    created_at = DateTimeField(auto_now_add=True)

    class Meta:
        abstract = True



class Application(CreatedBaseModel):
    class Status(TextChoices):
        IN_PROGRESS = "IN_PROGRESS","in_progress"
        COMPLETED = "COMPLETED","completed"
    image = ImageField(upload_to='applications/%Y/%m/%d',
                       validators=[FileExtensionValidator(['jpg', 'jpeg', 'png'])],
                       null=True, blank=True)
    fullname = CharField(max_length=255)
    phone = CharField(max_length=11,default='933977090')
    # phone tasdiqlash kerakmi
    region = ForeignKey('applications.Region', CASCADE)
    district = ForeignKey('applications.District', CASCADE, null=True, blank=True)
    description = TextField(max_length=255,null=True, blank=True)
    latitude = DecimalField(max_digits=9,decimal_places=6)
    longitude = DecimalField(max_digits=9, decimal_places=6)
    status=CharField(max_length=15,choices=Status.choices,default=Status.IN_PROGRESS)

class Region(Model):
    name = CharField(max_length=255)

    class Meta:
        verbose_name = "Region"
        verbose_name_plural = "Regions"

    def __str__(self):
        return f"{self.name}"


class District(Model):
    name = CharField(max_length=255)
    region = ForeignKey('applications.Region', CASCADE, related_name='districts')

    class Meta:
        verbose_name = "District"
        verbose_name_plural = "Districts"

    def __str__(self):
        return f"{self.name}"

