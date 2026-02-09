from applications.models import Application, District, Highlight, Region, Result
from django.contrib import admin
from django.contrib.admin import ModelAdmin
from django.utils.safestring import mark_safe

# Register your models here.


@admin.register(Application)
class ApplicationAdmin(ModelAdmin):
    list_display = ('id', 'image_tag', 'description', 'region', 'district', 'location')
    list_display_links = ('id', 'region')

    def location(self, obj):
        if obj.latitude and obj.longitude:
            return f"https://www.google.com/maps?q={obj.latitude},{obj.longitude}"
        return None

    def image_tag(self, obj):
        if obj.image:
            return mark_safe(
                f'<img src="{obj.image.url}" width="90" height="90" style="object-fit: cover;" />'
            )
        return "—"


@admin.register(Region)
class RegionAdmin(ModelAdmin):
    list_display = ('id', 'name')


@admin.register(District)
class DistrictAdmin(ModelAdmin):
    list_display = ('id', 'name', 'region')


@admin.register(Highlight)
class HighlightAdmin(ModelAdmin):
    list_display = ('id', 'name', 'image_tag')

    def image_tag(self, obj):
        if obj.image:
            return mark_safe(
                f'<img src="{obj.image.url}" width="90" height="90" style="object-fit: cover;" />'
            )
        return "—"


@admin.register(Result)
class ResultAdmin(ModelAdmin):
    list_display = ('id', 'application', 'description', 'image_tag')

    def image_tag(self, obj):
        if obj.image:
            return mark_safe(
                f'<img src="{obj.image.url}" width="90" height="90" style="object-fit: cover;" />'
            )
        return "—"
