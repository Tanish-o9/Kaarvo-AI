from rest_framework import permissions


class IsSellerOrReadOnly(permissions.BasePermission):
    """
    Custom permission to only allow sellers of an auction to edit or delete it.
    Read permissions are allowed to any request.
    """
    def has_object_permission(self, request, view, obj):
        # Read-only methods are allowed to any request
        if request.method in permissions.SAFE_METHODS:
            return True
        # Write permissions are only allowed to the seller or an admin
        return obj.seller == request.user or request.user.is_staff


class IsAuthenticatedBuyer(permissions.BasePermission):
    """
    Only authenticated, active users can place bids.
    """
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.is_active


class IsAuctionWinnerOrSeller(permissions.BasePermission):
    """
    Allows access only to the winning buyer, seller, or staff.
    """
    def has_object_permission(self, request, view, obj):
        if request.user.is_staff:
            return True
        winner = getattr(obj, 'winner', None)
        seller = getattr(obj, 'seller', None)
        return request.user == winner or request.user == seller

