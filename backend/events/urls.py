from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import EventViewSet, EventOperatorViewSet, TCardColumnViewSet, NetworkViewSet

router = DefaultRouter()
router.register(r'events', EventViewSet)
router.register(r'event-operators', EventOperatorViewSet)
router.register(r't-card-columns', TCardColumnViewSet)
router.register(r'networks', NetworkViewSet)

urlpatterns = [
    path('', include(router.urls)),
]