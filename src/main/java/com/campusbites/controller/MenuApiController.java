package com.campusbites.controller;

import com.campusbites.model.MenuItem;
import com.campusbites.service.MenuService;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/menu")
public class MenuApiController {

    private final MenuService menuService;

    public MenuApiController(MenuService menuService) {
        this.menuService = menuService;
    }

    /**
     * GET /api/menu — List all menu items, with optional category and search filters.
     */
    @GetMapping
    public List<MenuItem> getMenuItems(
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String search) {
        return menuService.getFilteredItems(category, search);
    }

    /**
     * GET /api/menu/categories — List all distinct categories.
     */
    @GetMapping("/categories")
    public List<String> getCategories() {
        return menuService.getCategories();
    }

    /**
     * POST /api/menu — Add a new menu item (multipart: JSON fields + optional image).
     */
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<MenuItem> addItem(
            @RequestParam String name,
            @RequestParam int price,
            @RequestParam String category,
            @RequestParam(required = false, defaultValue = "Delicious food item.") String description,
            @RequestParam(required = false) String imageUrl,
            @RequestParam(required = false) MultipartFile image) throws IOException {

        MenuItem item = new MenuItem();
        item.setName(name);
        item.setPrice(price);
        item.setCategory(category);
        item.setDescription(description);

        // If a URL is provided (e.g. base64 or external URL), use it as fallback
        if (imageUrl != null && !imageUrl.isEmpty()) {
            item.setImageUrl(imageUrl);
        } else {
            item.setImageUrl("https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop");
        }

        MenuItem saved = menuService.addItem(item, image);
        return ResponseEntity.ok(saved);
    }

    /**
     * DELETE /api/menu/{id} — Delete a menu item by ID.
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> deleteItem(@PathVariable Long id) {
        menuService.deleteItem(id);
        return ResponseEntity.ok(Map.of("message", "Item deleted successfully"));
    }
}
