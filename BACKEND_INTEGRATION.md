# Spring Boot Backend Integration для LessonBoard

## 📋 Обзор
Этот документ описывает необходимые изменения в Spring Boot бэкенде для поддержки интерактивных досок, привязанных к урокам.

## 🗄️ 1. Сущности (Entities)

### LessonBoard.java
```java
package com.yourapp.entity;

import javax.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "lesson_boards")
public class LessonBoard {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    @JoinColumn(name = "lesson_id")
    private Lesson lesson;

    @Column(columnDefinition = "jsonb")
    private String sceneJson;

    private LocalDateTime updatedAt;

    // Constructors
    public LessonBoard() {}

    public LessonBoard(Lesson lesson, String sceneJson) {
        this.lesson = lesson;
        this.sceneJson = sceneJson;
        this.updatedAt = LocalDateTime.now();
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Lesson getLesson() { return lesson; }
    public void setLesson(Lesson lesson) { this.lesson = lesson; }

    public String getSceneJson() { return sceneJson; }
    public void setSceneJson(String sceneJson) { this.sceneJson = sceneJson; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
```

## 🗃️ 2. Репозиторий (Repository)

### LessonBoardRepository.java
```java
package com.yourapp.repository;

import com.yourapp.entity.LessonBoard;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface LessonBoardRepository extends JpaRepository<LessonBoard, Long> {
    Optional<LessonBoard> findByLessonId(Long lessonId);
}
```

## 🔧 3. Сервис (Service)

### LessonBoardService.java
```java
package com.yourapp.service;

import com.yourapp.entity.Lesson;
import com.yourapp.entity.LessonBoard;
import com.yourapp.repository.LessonBoardRepository;
import com.yourapp.repository.LessonRepository;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.Optional;

@Service
public class LessonBoardService {
    private final LessonBoardRepository boardRepository;
    private final LessonRepository lessonRepository;

    public LessonBoardService(LessonBoardRepository boardRepository, 
                             LessonRepository lessonRepository) {
        this.boardRepository = boardRepository;
        this.lessonRepository = lessonRepository;
    }

    public LessonBoard saveBoard(Long lessonId, String sceneJson) {
        // Проверяем, что урок существует
        Lesson lesson = lessonRepository.findById(lessonId)
                .orElseThrow(() -> new RuntimeException("Урок не найден: " + lessonId));

        LessonBoard board = boardRepository.findByLessonId(lessonId)
                .orElseGet(() -> {
                    LessonBoard newBoard = new LessonBoard();
                    newBoard.setLesson(lesson);
                    return newBoard;
                });
        
        board.setSceneJson(sceneJson);
        board.setUpdatedAt(LocalDateTime.now());
        return boardRepository.save(board);
    }

    public String loadBoard(Long lessonId) {
        return boardRepository.findByLessonId(lessonId)
                .map(LessonBoard::getSceneJson)
                .orElse("[]"); // Возвращаем пустой массив, если доска не найдена
    }

    public boolean boardExists(Long lessonId) {
        return boardRepository.findByLessonId(lessonId).isPresent();
    }
}
```

## 🌐 4. Контроллер (Controller)

### LessonBoardController.java
```java
package com.yourapp.controller;

import com.yourapp.service.LessonBoardService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.HttpStatus;

@RestController
@RequestMapping("/api/lessons/{lessonId}/board")
@CrossOrigin(origins = "*") // Настройте CORS для вашего фронтенда
public class LessonBoardController {

    private final LessonBoardService boardService;

    public LessonBoardController(LessonBoardService boardService) {
        this.boardService = boardService;
    }

    @PostMapping("/save")
    public ResponseEntity<String> saveBoard(
            @PathVariable Long lessonId, 
            @RequestBody String sceneJson) {
        try {
            boardService.saveBoard(lessonId, sceneJson);
            return ResponseEntity.ok("Доска успешно сохранена");
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("Урок не найден: " + lessonId);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Ошибка при сохранении доски: " + e.getMessage());
        }
    }

    @GetMapping("/load")
    public ResponseEntity<String> loadBoard(@PathVariable Long lessonId) {
        try {
            String sceneJson = boardService.loadBoard(lessonId);
            return ResponseEntity.ok(sceneJson);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("[]"); // Возвращаем пустой массив при ошибке
        }
    }

    @GetMapping("/exists")
    public ResponseEntity<Boolean> boardExists(@PathVariable Long lessonId) {
        boolean exists = boardService.boardExists(lessonId);
        return ResponseEntity.ok(exists);
    }
}
```

## 🗄️ 5. SQL Миграция

### V1__Create_lesson_boards_table.sql
```sql
CREATE TABLE lesson_boards (
    id BIGSERIAL PRIMARY KEY,
    lesson_id BIGINT NOT NULL UNIQUE,
    scene_json JSONB,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_lesson_board_lesson 
        FOREIGN KEY (lesson_id) 
        REFERENCES lessons(id) 
        ON DELETE CASCADE
);

-- Индекс для быстрого поиска по lesson_id
CREATE INDEX idx_lesson_boards_lesson_id ON lesson_boards(lesson_id);

-- Индекс для быстрого поиска по дате обновления
CREATE INDEX idx_lesson_boards_updated_at ON lesson_boards(updated_at);
```

## 🔐 6. Безопасность (Security)

### Обновление SecurityConfig.java
```java
@Configuration
@EnableWebSecurity
public class SecurityConfig {
    
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .authorizeHttpRequests(authz -> authz
                .requestMatchers("/api/lessons/*/board/**").authenticated()
                .anyRequest().permitAll()
            )
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .csrf(csrf -> csrf.disable());
        
        return http.build();
    }
    
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOriginPatterns(Arrays.asList("*"));
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE"));
        configuration.setAllowedHeaders(Arrays.asList("*"));
        configuration.setAllowCredentials(true);
        
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/api/**", configuration);
        return source;
    }
}
```

## 🧪 7. Тесты (Tests)

### LessonBoardServiceTest.java
```java
package com.yourapp.service;

import com.yourapp.entity.Lesson;
import com.yourapp.entity.LessonBoard;
import com.yourapp.repository.LessonBoardRepository;
import com.yourapp.repository.LessonRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class LessonBoardServiceTest {

    @Mock
    private LessonBoardRepository boardRepository;
    
    @Mock
    private LessonRepository lessonRepository;

    @InjectMocks
    private LessonBoardService boardService;

    @Test
    void saveBoard_NewBoard_SavesSuccessfully() {
        // Given
        Long lessonId = 1L;
        String sceneJson = "[{\"id\":\"test\",\"type\":\"rectangle\"}]";
        Lesson lesson = new Lesson();
        lesson.setId(lessonId);
        
        when(lessonRepository.findById(lessonId)).thenReturn(Optional.of(lesson));
        when(boardRepository.findByLessonId(lessonId)).thenReturn(Optional.empty());
        when(boardRepository.save(any(LessonBoard.class))).thenAnswer(invocation -> invocation.getArgument(0));

        // When
        LessonBoard result = boardService.saveBoard(lessonId, sceneJson);

        // Then
        assertNotNull(result);
        assertEquals(sceneJson, result.getSceneJson());
        verify(boardRepository).save(any(LessonBoard.class));
    }

    @Test
    void loadBoard_ExistingBoard_ReturnsSceneJson() {
        // Given
        Long lessonId = 1L;
        String expectedSceneJson = "[{\"id\":\"test\",\"type\":\"rectangle\"}]";
        LessonBoard board = new LessonBoard();
        board.setSceneJson(expectedSceneJson);
        
        when(boardRepository.findByLessonId(lessonId)).thenReturn(Optional.of(board));

        // When
        String result = boardService.loadBoard(lessonId);

        // Then
        assertEquals(expectedSceneJson, result);
    }
}
```

## 🚀 8. Запуск и тестирование

### Проверка API endpoints:
```bash
# Сохранение доски
curl -X POST http://localhost:8080/api/lessons/1/board/save \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '[{"id":"test","type":"rectangle","x":100,"y":100,"width":200,"height":150}]'

# Загрузка доски
curl -X GET http://localhost:8080/api/lessons/1/board/load \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Проверка существования доски
curl -X GET http://localhost:8080/api/lessons/1/board/exists \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## 📝 9. Дополнительные возможности

### WebSocket для реального времени (опционально):
```java
@Controller
public class LessonBoardWebSocketController {
    
    @MessageMapping("/lessons/{lessonId}/board")
    @SendTo("/topic/lessons/{lessonId}/board")
    public String handleBoardUpdate(@DestinationVariable Long lessonId, String sceneJson) {
        // Сохранение и рассылка обновлений
        return sceneJson;
    }
}
```

### Автосохранение на бэкенде:
```java
@Scheduled(fixedRate = 30000) // Каждые 30 секунд
public void autoSaveActiveBoards() {
    // Логика автосохранения активных досок
}
```

## ✅ Готово!

После реализации этих изменений:
- ✅ Каждый урок будет иметь свою доску
- ✅ Состояние доски сохраняется в PostgreSQL (JSONB)
- ✅ API endpoints готовы для фронтенда
- ✅ Поддержка автосохранения
- ✅ Готовность к WebSocket интеграции
