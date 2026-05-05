package com.campusbites.service;

import com.campusbites.model.MenuItem;
import com.campusbites.repository.MenuItemRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.*;
import java.util.List;
import java.util.UUID;

@Service
public class MenuService {

    private final MenuItemRepository repository;
    private final String uploadDir;

    public MenuService(MenuItemRepository repository,
                       @Value("${app.upload-dir}") String uploadDir) {
        this.repository = repository;
        this.uploadDir = uploadDir;
    }

    public List<MenuItem> getAllItems() {
        return repository.findAll();
    }

    public List<MenuItem> getFilteredItems(String category, String search) {
        if (category != null && !category.isEmpty() && search != null && !search.isEmpty()) {
            return repository.findByCategoryAndNameContainingIgnoreCase(category, search);
        } else if (category != null && !category.isEmpty()) {
            return repository.findByCategory(category);
        } else if (search != null && !search.isEmpty()) {
            return repository.findByNameContainingIgnoreCase(search);
        }
        return repository.findAll();
    }

    public List<String> getCategories() {
        return repository.findDistinctCategories();
    }

    public MenuItem addItem(MenuItem item, MultipartFile imageFile) throws IOException {
        if (imageFile != null && !imageFile.isEmpty()) {
            String filename = UUID.randomUUID() + "_" + imageFile.getOriginalFilename();
            Path uploadPath = Paths.get(uploadDir);
            Files.createDirectories(uploadPath);
            Files.copy(imageFile.getInputStream(), uploadPath.resolve(filename),
                       StandardCopyOption.REPLACE_EXISTING);
            item.setImageUrl("/uploads/" + filename);
        }
        return repository.save(item);
    }

    public void deleteItem(Long id) {
        repository.deleteById(id);
    }

    public long getItemCount() {
        return repository.count();
    }
}
