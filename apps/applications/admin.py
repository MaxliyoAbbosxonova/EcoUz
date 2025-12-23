from django.contrib import admin
from django.contrib.admin import ModelAdmin
from django.utils.safestring import mark_safe

from applications.models import Application, District, Region


# Register your models here.


@admin.register(Application)
class ApplicationAdmin(ModelAdmin):
    list_display = ('image_tag', 'region', 'district', 'location')

    def location(self, obj):
        if obj.latitude and obj.longitude:
            return f"https://www.google.com/maps?q={obj.latitude},{obj.longitude}"
        return None

    def image_tag(self, obj: Application):
        return mark_safe(f'<img src="{obj.image.url}" width="90" height="90" />')


@admin.register(Region)
class RegionAdmin(ModelAdmin):
    list_display = ('id', 'name')


@admin.register(District)
class DistrictAdmin(ModelAdmin):
    list_display = ('id', 'name','region')
