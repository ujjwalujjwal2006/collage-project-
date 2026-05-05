package com.campusbites.service;

import com.campusbites.model.Order;
import com.campusbites.model.Order.OrderStatus;
import com.campusbites.model.OrderItem;
import com.campusbites.repository.MenuItemRepository;
import com.campusbites.repository.OrderRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.temporal.WeekFields;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class OrderService {

    private final OrderRepository orderRepository;
    private final MenuItemRepository menuItemRepository;

    public OrderService(OrderRepository orderRepository, MenuItemRepository menuItemRepository) {
        this.orderRepository = orderRepository;
        this.menuItemRepository = menuItemRepository;
    }

    /**
     * Get revenue analytics grouped by month and by week.
     * Returns data for the last 12 months and last 12 weeks.
     */
    public Map<String, Object> getRevenueAnalytics() {
        List<Order> allOrders = orderRepository.findAll();
        Map<String, Object> analytics = new HashMap<>();

        // ====== MONTHLY REVENUE (last 12 months) ======
        LocalDate now = LocalDate.now();
        DateTimeFormatter monthFormatter = DateTimeFormatter.ofPattern("MMM yyyy");
        List<Map<String, Object>> monthlyData = new ArrayList<>();

        for (int i = 11; i >= 0; i--) {
            LocalDate monthStart = now.minusMonths(i).withDayOfMonth(1);
            LocalDate monthEnd = monthStart.plusMonths(1);
            String label = monthStart.format(monthFormatter);

            int revenue = 0;
            int orderCount = 0;
            for (Order order : allOrders) {
                LocalDate orderDate = order.getCreatedAt().toLocalDate();
                if (!orderDate.isBefore(monthStart) && orderDate.isBefore(monthEnd)) {
                    revenue += order.getTotal();
                    orderCount++;
                }
            }

            Map<String, Object> entry = new LinkedHashMap<>();
            entry.put("label", label);
            entry.put("revenue", revenue);
            entry.put("orders", orderCount);
            monthlyData.add(entry);
        }

        // ====== WEEKLY REVENUE (last 12 weeks) ======
        List<Map<String, Object>> weeklyData = new ArrayList<>();
        WeekFields weekFields = WeekFields.of(Locale.getDefault());
        DateTimeFormatter weekDayFormatter = DateTimeFormatter.ofPattern("dd MMM");

        for (int i = 11; i >= 0; i--) {
            LocalDate weekStart = now.minusWeeks(i);
            // Adjust to start of week (Monday)
            weekStart = weekStart.with(weekFields.dayOfWeek(), 1);
            LocalDate weekEnd = weekStart.plusDays(7);
            String label = weekStart.format(weekDayFormatter) + " - " + weekEnd.minusDays(1).format(weekDayFormatter);

            int revenue = 0;
            int orderCount = 0;
            for (Order order : allOrders) {
                LocalDate orderDate = order.getCreatedAt().toLocalDate();
                if (!orderDate.isBefore(weekStart) && orderDate.isBefore(weekEnd)) {
                    revenue += order.getTotal();
                    orderCount++;
                }
            }

            Map<String, Object> entry = new LinkedHashMap<>();
            entry.put("label", label);
            entry.put("revenue", revenue);
            entry.put("orders", orderCount);
            weeklyData.add(entry);
        }

        // ====== TODAY's REVENUE ======
        int todayRevenue = 0;
        int todayOrders = 0;
        for (Order order : allOrders) {
            if (order.getCreatedAt().toLocalDate().equals(now)) {
                todayRevenue += order.getTotal();
                todayOrders++;
            }
        }

        // ====== THIS WEEK's REVENUE ======
        LocalDate thisWeekStart = now.with(weekFields.dayOfWeek(), 1);
        int weekRevenue = 0;
        int weekOrders = 0;
        for (Order order : allOrders) {
            LocalDate orderDate = order.getCreatedAt().toLocalDate();
            if (!orderDate.isBefore(thisWeekStart) && !orderDate.isAfter(now)) {
                weekRevenue += order.getTotal();
                weekOrders++;
            }
        }

        // ====== THIS MONTH's REVENUE ======
        LocalDate thisMonthStart = now.withDayOfMonth(1);
        int monthRevenue = 0;
        int monthOrders = 0;
        for (Order order : allOrders) {
            LocalDate orderDate = order.getCreatedAt().toLocalDate();
            if (!orderDate.isBefore(thisMonthStart) && !orderDate.isAfter(now)) {
                monthRevenue += order.getTotal();
                monthOrders++;
            }
        }

        analytics.put("monthly", monthlyData);
        analytics.put("weekly", weeklyData);
        analytics.put("todayRevenue", todayRevenue);
        analytics.put("todayOrders", todayOrders);
        analytics.put("weekRevenue", weekRevenue);
        analytics.put("weekOrders", weekOrders);
        analytics.put("monthRevenue", monthRevenue);
        analytics.put("monthOrders", monthOrders);

        return analytics;
    }

    public Order placeOrder(String customerName, String rollNumber, List<Map<String, Object>> items) {
        String orderId = "ORD-" + Long.toString(System.currentTimeMillis(), 36).toUpperCase();

        Order order = new Order();
        order.setId(orderId);
        order.setCustomerName(customerName);
        order.setRollNumber(rollNumber);
        order.setStatus(OrderStatus.PENDING);
        order.setCreatedAt(LocalDateTime.now());

        int total = 0;
        for (Map<String, Object> item : items) {
            String name = (String) item.get("name");
            int qty = ((Number) item.get("qty")).intValue();
            int price = ((Number) item.get("price")).intValue();
            total += price * qty;

            OrderItem orderItem = new OrderItem(name, qty, price);
            order.addItem(orderItem);
        }
        order.setTotal(total);

        return orderRepository.save(order);
    }

    public List<Order> getAllOrders() {
        return orderRepository.findAllByOrderByCreatedAtDesc();
    }

    public List<Order> getOrdersByRoll(String rollNumber) {
        return orderRepository.findByRollNumberOrderByCreatedAtDesc(rollNumber);
    }

    public Order advanceStatus(String orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found: " + orderId));

        switch (order.getStatus()) {
            case PENDING -> order.setStatus(OrderStatus.READY);
            case READY -> order.setStatus(OrderStatus.PICKED);
            case PICKED -> {} // Already final state
        }

        return orderRepository.save(order);
    }

    public void deleteOrder(String orderId) {
        orderRepository.deleteById(orderId);
    }

    public Map<String, Object> getStats() {
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalItems", menuItemRepository.count());
        stats.put("totalOrders", orderRepository.count());
        stats.put("totalRevenue", orderRepository.getTotalRevenue());
        return stats;
    }
}
