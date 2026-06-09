from rest_framework.routers import DefaultRouter

from apps.links.views import LinkViewSet


router = DefaultRouter()
router.register("links", LinkViewSet, basename="links")

urlpatterns = router.urls