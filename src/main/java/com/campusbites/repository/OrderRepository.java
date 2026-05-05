package com.campusbites.repository;

import com.campusbites.model.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OrderRepository extends JpaRepository<Order, String> {

    List<Order> findByRollNumberOrderByCreatedAtDesc(String rollNumber);

    List<Order> findAllByOrderByCreatedAtDesc();

    @Query("SELECT COALESCE(SUM(o.total), 0) FROM Order o")
    int getTotalRevenue();
}
