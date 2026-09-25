package lk.gov.nexus.config;

import io.jsonwebtoken.Claims;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lk.gov.nexus.entity.User;
import lk.gov.nexus.util.UserContext;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

@Component
public class AuthInterceptor implements HandlerInterceptor {

    @Autowired
    private JwtUtil jwtUtil;

    @Value("${app.environment:development}")
    private String environment;

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
        UserContext.clear();

        // Allow CORS preflight requests
        if ("OPTIONS".equalsIgnoreCase(request.getMethod())) {
            return true;
        }

        String authHeader = request.getHeader("Authorization");
        String devStaffRole = request.getHeader("x-staff-role");

        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7).trim();
            Claims claims = jwtUtil.extractClaims(token);

            if (claims != null) {
                User user = new User();
                Number uid = (Number) claims.get("user_id");
                user.setUserId(uid != null ? uid.longValue() : 1L);
                user.setUsername((String) claims.get("username"));
                user.setEmail((String) claims.get("email"));
                user.setRole((String) claims.get("role"));
                user.setFullName((String) claims.get("full_name"));

                UserContext.setCurrentUser(user);
                return true;
            }
        }

        // Development fallback context
        if ("development".equalsIgnoreCase(environment) || devStaffRole != null) {
            User devUser = new User();
            devUser.setUserId(1L);
            devUser.setUsername("admin");
            devUser.setEmail("admin@nexusgov.lk");
            devUser.setRole(devStaffRole != null && !devStaffRole.trim().isEmpty() ? devStaffRole : "Admin");
            devUser.setFullName("System Administrator");
            UserContext.setCurrentUser(devUser);
            return true;
        }

        return true;
    }

    @Override
    public void afterCompletion(HttpServletRequest request, HttpServletResponse response, Object handler, Exception ex) {
        UserContext.clear();
    }
}
