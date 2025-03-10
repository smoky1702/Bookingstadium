package com.example.bookingStadium.repository;


import com.example.bookingStadium.entity.Roles;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RoleRepository extends JpaRepository<Roles, Integer> {

}
