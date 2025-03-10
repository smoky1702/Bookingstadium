package com.example.bookingStadium.repository;

import com.example.bookingStadium.entity.Type_Of_Stadium;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TypeRepository extends JpaRepository<Type_Of_Stadium, Integer> {
    boolean existsByTypeName(String typeName);
}
