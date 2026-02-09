import os
from io import BytesIO

from django.core.files.base import ContentFile
from django.core.validators import FileExtensionValidator
from django.db.models import (
    CASCADE,
    SET_NULL,
    CharField,
    DateTimeField,
    ForeignKey,
    ImageField,
    Model,
    OneToOneField,
    TextChoices,
    TextField,
)
from django.db.models.fields import DecimalField
from django.utils.translation import gettext_lazy as _  # Create your models here.
from PIL import Image as PilImage


class CreatedBaseModel(Model):
    created_at = DateTimeField(auto_now_add=True)

    class Meta:
        abstract = True


class Application(CreatedBaseModel):
    class Status(TextChoices):
        NEW = "NEW", "new"
        ASSIGNED = "ASSIGNED", "assigned"
        ACCEPTED = "ACCEPTED", "accepted"
        DONE = "DONE", "done"
        REJECTED = "REJECTED", "rejected"

    image = ImageField(_('Rasm'), upload_to='applications/%Y/%m/%d',
                       validators=[FileExtensionValidator(['jpg', 'jpeg', 'png', 'webp'])],
                       null=True, blank=True)
    fullname = CharField(_('To`liq ism'), max_length=255)
    phone = CharField(_('Telefon raqam'), max_length=11, default='933977090')
    # phone tasdiqlash kerakmi
    region = ForeignKey('applications.Region', CASCADE, verbose_name=_("Viloyat"))
    district = ForeignKey('applications.District', CASCADE, null=True, blank=True, verbose_name=_("Tuman"))
    description = TextField(_('Tafsif'), max_length=255, null=True, blank=True)
    latitude = DecimalField(max_digits=9, decimal_places=7, verbose_name=_("Latitude"))
    longitude = DecimalField(max_digits=9, decimal_places=7, verbose_name=_("Longitude"))
    status = CharField(max_length=15, choices=Status.choices, default=Status.NEW, verbose_name=_("Status"))
    assigned_to = ForeignKey("users.User", on_delete=SET_NULL, null=True, blank=True,
                             limit_choices_to={'role': 'EXECUTOR'}, verbose_name=_("Mas’ul ijrochi"))

    def save(self, *args, **kwargs):
        if self.image and not self.image.name.lower().endswith(".webp"):
            img = PilImage.open(self.image)

            if img.mode in ("RGBA", "P"):
                img = img.convert("RGB")

            buffer = BytesIO()
            img.save(buffer, format="WEBP", quality=80)

            new_name = os.path.splitext(self.image.name)[0] + ".webp"
            self.image.save(new_name, ContentFile(buffer.getvalue()), save=False)

        super().save(*args, **kwargs)

    class Meta:
        verbose_name = _("Murojaat")
        verbose_name_plural = _("Murojaatlar")

    def __str__(self):
        return self.description or self.fullname


class Result(CreatedBaseModel):
    application = OneToOneField(
        Application,
        CASCADE,
        related_name='results'
    )
    description = TextField(blank=True)
    image = ImageField(upload_to='results/%Y/%m/%d',
                       validators=[FileExtensionValidator(['jpg', 'jpeg', 'png', 'webp'])], null=True, blank=True)

    def save(self, *args, **kwargs):
        if self.image and not self.image.name.lower().endswith(".webp"):
            img = PilImage.open(self.image)

            if img.mode in ("RGBA", "P"):
                img = img.convert("RGB")

            buffer = BytesIO()
            img.save(buffer, format="WEBP", quality=80)

            new_name = os.path.splitext(self.image.name)[0] + ".webp"
            self.image.save(new_name, ContentFile(buffer.getvalue()), save=False)

        super().save(*args, **kwargs)

    class Meta:
        verbose_name = _("Natija")
        verbose_name_plural = _("Natijalar")


class Region(Model):
    name = CharField(_("Nomi"), max_length=255)

    class Meta:
        verbose_name = _("Viloyat")
        verbose_name_plural = _("Viloyatlar")

    def __str__(self):
        return f"{self.name}"


class District(Model):
    name = CharField(_("Nomi"), max_length=255)
    region = ForeignKey('applications.Region', CASCADE, related_name='districts')

    class Meta:
        verbose_name = _("Tuman")
        verbose_name_plural = _("Tuman")

    def __str__(self):
        return f"{self.name}"


class Highlight(CreatedBaseModel):
    name = CharField(_('Nomi'), max_length=255)
    image = ImageField(_("Rasm"), upload_to='products/%Y/%m/%d')

    def __str__(self):
        return f"Advertising: {self.id}"

    class Meta:
        verbose_name = _("Banner")
        verbose_name_plural = _("Bannerlar")
