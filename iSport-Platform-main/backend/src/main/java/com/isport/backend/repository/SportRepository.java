package com.isport.backend.repository;

import com.isport.backend.entity.Sport;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SportRepository extends JpaRepository<Sport, Long> {

    boolean existsByNameIgnoreCase(String name);
}
