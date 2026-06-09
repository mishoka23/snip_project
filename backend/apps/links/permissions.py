from rest_framework import permissions

# Allows access only to the owner of the object or an admin user
class IsOwnerOrAdmin(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        if request.user and request.user.is_staff:
            return True

        return obj.owner == request.user