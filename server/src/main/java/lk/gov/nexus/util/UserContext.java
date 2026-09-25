package lk.gov.nexus.util;

import lk.gov.nexus.entity.User;

public class UserContext {

    private static final ThreadLocal<User> CURRENT_USER = new ThreadLocal<>();

    public static void setCurrentUser(User user) {
        CURRENT_USER.set(user);
    }

    public static User getCurrentUser() {
        return CURRENT_USER.get();
    }

    public static Long getCurrentUserId() {
        User u = CURRENT_USER.get();
        return u != null ? u.getUserId() : null;
    }

    public static String getCurrentUserRole() {
        User u = CURRENT_USER.get();
        return u != null ? u.getRole() : null;
    }

    public static void clear() {
        CURRENT_USER.remove();
    }
}
