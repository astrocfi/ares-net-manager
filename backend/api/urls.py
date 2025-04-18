from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'operators', views.OperatorViewSet)
router.register(r'events', views.EventViewSet)
router.register(r'networks', views.NetworkViewSet)
router.register(r'event-operators', views.EventOperatorViewSet)
router.register(r'activity-logs', views.ActivityLogViewSet)
router.register(r't-card-columns', views.TCardColumnViewSet)

urlpatterns = [
    path('', include(router.urls)),
]