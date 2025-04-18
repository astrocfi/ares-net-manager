from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import EventViewSet, TCardColumnViewSet

router = DefaultRouter()
router.register(r'events', EventViewSet)
router.register(r't-card-columns', TCardColumnViewSet)

urlpatterns = [
    path('', include(router.urls)),
]