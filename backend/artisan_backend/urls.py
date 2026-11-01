from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from artisan_api.views import AssistantChatView, TranslateTextView, LoginView, RegisterView, TokenRefreshCustomView

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/chat', AssistantChatView.as_view(), name='api-chat-direct'),
    path('api/chat/', AssistantChatView.as_view(), name='api-chat-slash'),
    path('api/v1/chat', AssistantChatView.as_view(), name='api-v1-chat-direct'),
    path('api/v1/chat/', AssistantChatView.as_view(), name='api-v1-chat-slash'),
    path('api/translate', TranslateTextView.as_view(), name='api-translate-direct'),
    path('api/translate/', TranslateTextView.as_view(), name='api-translate-slash'),
    path('api/v1/translate', TranslateTextView.as_view(), name='api-v1-translate-direct'),
    path('api/v1/translate/', TranslateTextView.as_view(), name='api-v1-translate-slash'),
    path('api/auth/login', LoginView.as_view(), name='api-auth-login-direct'),
    path('api/auth/login/', LoginView.as_view(), name='api-auth-login-slash'),
    path('api/v1/auth/login', LoginView.as_view(), name='api-v1-auth-login-direct'),
    path('api/v1/auth/login/', LoginView.as_view(), name='api-v1-auth-login-slash'),
    path('api/auth/register', RegisterView.as_view(), name='api-auth-register-direct'),
    path('api/auth/register/', RegisterView.as_view(), name='api-auth-register-slash'),
    path('api/v1/auth/register', RegisterView.as_view(), name='api-v1-auth-register-direct'),
    path('api/v1/auth/register/', RegisterView.as_view(), name='api-v1-auth-register-slash'),
    path('api/auth/refresh', TokenRefreshCustomView.as_view(), name='api-auth-refresh-direct'),
    path('api/auth/refresh/', TokenRefreshCustomView.as_view(), name='api-auth-refresh-slash'),
    path('api/v1/auth/refresh', TokenRefreshCustomView.as_view(), name='api-v1-auth-refresh-direct'),
    path('api/v1/auth/refresh/', TokenRefreshCustomView.as_view(), name='api-v1-auth-refresh-slash'),
    path('api/v1/', include('artisan_api.urls')),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
