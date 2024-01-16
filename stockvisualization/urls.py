from django.contrib import admin
from django.urls import path, include


urlpatterns = [
    # Home page route handled by the 'app.urls' module
    path('', include("app.urls")),
    path('admin/', admin.site.urls),
]
