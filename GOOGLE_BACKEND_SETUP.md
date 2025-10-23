# Google OAuth2 Backend Setup

## 🔧 Spring Boot Configuration

### 1. application.properties

```properties
# Google OAuth2
spring.security.oauth2.client.registration.google.client-id=YOUR_CLIENT_ID
spring.security.oauth2.client.registration.google.client-secret=YOUR_CLIENT_SECRET
spring.security.oauth2.client.registration.google.scope=email,profile,https://www.googleapis.com/auth/calendar.readonly
spring.security.oauth2.client.registration.google.redirect-uri={baseUrl}/auth/oauth2/success

# Google Calendar API
google.calendar.application-name=TeacherApp
google.calendar.webhook.url=https://yourdomain.com/api/google/calendar/notifications
```

### 2. Security Configuration

```java
@Configuration
@EnableWebSecurity
public class SecurityConfig {
    
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .oauth2Login(oauth2 -> oauth2
                .successHandler(oAuth2AuthenticationSuccessHandler())
                .failureHandler(oAuth2AuthenticationFailureHandler())
            )
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/oauth2/**", "/auth/oauth2/**").permitAll()
                .requestMatchers("/api/google/**").authenticated()
                .anyRequest().authenticated()
            );
        return http.build();
    }
    
    @Bean
    public AuthenticationSuccessHandler oAuth2AuthenticationSuccessHandler() {
        return (request, response, authentication) -> {
            // Генерация JWT токена
            String jwt = jwtService.generateToken(authentication);
            String refreshToken = jwtService.generateRefreshToken(authentication);
            
            // Сохранение Google токенов в БД
            OAuth2User oAuth2User = (OAuth2User) authentication.getPrincipal();
            saveGoogleTokens(oAuth2User);
            
            // Редирект на фронтенд с токенами
            String redirectUrl = String.format(
                "http://localhost:3000/auth/oauth2/success?token=%s&refreshToken=%s",
                jwt, refreshToken
            );
            response.sendRedirect(redirectUrl);
        };
    }
}
```

### 3. Google Calendar Controller

```java
@RestController
@RequestMapping("/api/google/calendar")
@RequiredArgsConstructor
public class GoogleCalendarController {
    
    private final GoogleCalendarService googleCalendarService;
    
    @GetMapping("/sync")
    public ResponseEntity<List<Lesson>> syncUserCalendar(
            @RequestParam UUID userId) {
        List<Lesson> lessons = googleCalendarService.syncUserCalendar(userId);
        return ResponseEntity.ok(lessons);
    }
    
    @GetMapping("/connected")
    public ResponseEntity<Map<String, Object>> checkConnection(
            @RequestParam UUID userId) {
        boolean connected = googleCalendarService.isUserConnected(userId);
        LocalDateTime lastSync = googleCalendarService.getLastSyncTime(userId);
        
        return ResponseEntity.ok(Map.of(
            "connected", connected,
            "lastSync", lastSync != null ? lastSync : ""
        ));
    }
    
    @PostMapping("/notifications")
    public ResponseEntity<Void> handleWebhook(
            @RequestHeader("X-Goog-Channel-ID") String channelId,
            @RequestHeader("X-Goog-Resource-State") String resourceState,
            @RequestBody(required = false) String body) {
        
        if ("sync".equals(resourceState)) {
            googleCalendarService.handleWebhookNotification(channelId);
        }
        
        return ResponseEntity.ok().build();
    }
}
```

### 4. Google Calendar Service

```java
@Service
@RequiredArgsConstructor
public class GoogleCalendarService {
    
    private final GoogleTokenRepository tokenRepository;
    private final LessonRepository lessonRepository;
    
    public List<Lesson> syncUserCalendar(UUID userId) {
        GoogleToken token = tokenRepository.findByUserId(userId)
            .orElseThrow(() -> new RuntimeException("Google not connected"));
        
        Calendar service = createCalendarService(token);
        
        DateTime now = new DateTime(System.currentTimeMillis());
        Events events = service.events().list("primary")
            .setTimeMin(now)
            .setMaxResults(100)
            .execute();
        
        List<Lesson> lessons = new ArrayList<>();
        for (Event event : events.getItems()) {
            Lesson lesson = convertEventToLesson(event, userId);
            lessons.add(lessonRepository.save(lesson));
        }
        
        // Обновить время последней синхронизации
        token.setLastSync(LocalDateTime.now());
        tokenRepository.save(token);
        
        return lessons;
    }
    
    private Calendar createCalendarService(GoogleToken token) {
        Credential credential = new GoogleCredential.Builder()
            .setTransport(GoogleNetHttpTransport.newTrustedTransport())
            .setJsonFactory(GsonFactory.getDefaultInstance())
            .setClientSecrets(clientId, clientSecret)
            .build()
            .setAccessToken(token.getAccessToken())
            .setRefreshToken(token.getRefreshToken());
        
        return new Calendar.Builder(
            GoogleNetHttpTransport.newTrustedTransport(),
            GsonFactory.getDefaultInstance(),
            credential)
            .setApplicationName("TeacherApp")
            .build();
    }
    
    public void setupWebhook(UUID userId) {
        GoogleToken token = tokenRepository.findByUserId(userId)
            .orElseThrow();
        Calendar service = createCalendarService(token);
        
        Channel channel = new Channel()
            .setId(UUID.randomUUID().toString())
            .setType("web_hook")
            .setAddress(webhookUrl);
        
        service.events().watch("primary", channel).execute();
    }
}
```

### 5. Entity для хранения токенов

```java
@Entity
@Table(name = "google_tokens")
@Data
public class GoogleToken {
    @Id
    @GeneratedValue
    private Long id;
    
    @Column(nullable = false, unique = true)
    private UUID userId;
    
    @Column(nullable = false)
    private String accessToken;
    
    @Column(nullable = false)
    private String refreshToken;
    
    private LocalDateTime expiresAt;
    private LocalDateTime lastSync;
    
    @Column(unique = true)
    private String webhookChannelId;
}
```

## 🔑 Google Cloud Console Setup

1. Перейти на https://console.cloud.google.com
2. Создать новый проект или выбрать существующий
3. Включить Google Calendar API
4. Создать OAuth 2.0 credentials
5. Добавить authorized redirect URIs:
   - `http://localhost:8080/auth/oauth2/success`
   - `https://yourdomain.com/auth/oauth2/success`
6. Скопировать Client ID и Client Secret в application.properties

## 📋 Зависимости (pom.xml)

```xml
<dependencies>
    <!-- Spring Security OAuth2 -->
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-oauth2-client</artifactId>
    </dependency>
    
    <!-- Google Calendar API -->
    <dependency>
        <groupId>com.google.apis</groupId>
        <artifactId>google-api-services-calendar</artifactId>
        <version>v3-rev20220715-2.0.0</version>
    </dependency>
    
    <dependency>
        <groupId>com.google.oauth-client</groupId>
        <artifactId>google-oauth-client-jetty</artifactId>
        <version>1.34.1</version>
    </dependency>
</dependencies>
```

## ✅ Готово!

После настройки backend фронтенд автоматически подключится к этим endpoints! 🚀
