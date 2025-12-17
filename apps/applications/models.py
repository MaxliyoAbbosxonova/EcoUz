from django.core.validators import FileExtensionValidator
from django.db.models import Model, ImageField, ForeignKey, CASCADE, TextField, DateTimeField
from django.db.models.fields import DecimalField
from django.forms import CharField
from django.utils.translation import gettext_lazy as _


# Create your models here.


class Application(Model):
    image = ImageField(upload_to='products/%Y/%m/%d',
                       validators=[FileExtensionValidator(['jpg', 'jpeg', 'png'])],
                       null=True, blank=True)
    fullname = CharField(max_length=255)
    phone = CharField(max_length=11)
    # phone tasdiqlash kerakmi
    region = ForeignKey('applications.Region', CASCADE)
    district = ForeignKey('applications.District', CASCADE, null=True, blank=True)
    # address = TextField(max_length=255)
    description = TextField(max_length=255,null=True, blank=True)
    latitude = DecimalField(max_digits=9,decimal_places=6)
    longitude = DecimalField(max_digits=9, decimal_places=6)

class Region(Model):
    name = CharField(max_length=255)

    class Meta:
        verbose_name = "Region"
        verbose_name_plural = "Regions"

    def __str__(self):
        return f"{self.name}"


class District(Model):
    name = CharField(max_length=255)
    region = ForeignKey(Region, CASCADE, related_name='districts')

    class Meta:
        verbose_name = _("District")
        verbose_name_plural = _("Districts")


class CreatedBaseModel(Model):
    created_at = DateTimeField(auto_now_add=True)

    class Meta:
        abstract = True
