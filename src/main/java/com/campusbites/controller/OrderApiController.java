package com.campusbites.controller;

import com.campusbites.model.Order;
import com.campusbites.service.OrderService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/orders")
public class OrderApiController {

    private final OrderService orderService;

    public OrderApiController(OrderService orderService) {
        this.orderService = orderService;
    }

    /**
     * GET /api/orders — All orders (manager), or filtered by roll number (student).
     */
    @GetMapping
    public List<Order> getOrders(@RequestParam(required = false) String roll) {
        if (roll != null && !roll.isEmpty()) {
            return orderService.getOrdersByRoll(roll);
        }
        return orderService.getAllOrders();
    }

    /**
     * POST /api/orders — Place a new order.
     * Request body: { "customer": "...", "roll": "...", "items": [{ "name": "...", "qty": 1, "price": 40 }] }
     */
    @PostMapping
    public ResponseEntity<Order> placeOrder(@RequestBody Map<String, Object> body) {
        String customer = (String) body.get("customer");
        String roll = (String) body.get("roll");
        @SuppressWarnings("unchecked")
        List<Map<String, Object>> items = (List<Map<String, Object>>) body.get("items");

        Order order = orderService.placeOrder(customer, roll, items);
        return ResponseEntity.ok(order);
    }

    /**
     * PUT /api/orders/{id}/advance — Advance order status (pending → ready → picked).
     */
    @PutMapping("/{id}/advance")
    public ResponseEntity<Order> advanceStatus(@PathVariable String id) {
        Order order = orderService.advanceStatus(id);
        return ResponseEntity.ok(order);
    }

    /**
     * DELETE /api/orders/{id} — Delete an order.
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> deleteOrder(@PathVariable String id) {
        orderService.deleteOrder(id);
        return ResponseEntity.ok(Map.of("message", "Order deleted successfully"));
    }

    /**
     * GET /api/orders/stats — Dashboard statistics.
     */
    @GetMapping("/stats")
    public Map<String, Object> getStats() {
        return orderService.getStats();
    }

    /**
     * GET /api/orders/stats/revenue — Revenue analytics (monthly + weekly).
     */
    @GetMapping("/stats/revenue")
    public Map<String, Object> getRevenueAnalytics() {
        return orderService.getRevenueAnalytics();
    }
}
