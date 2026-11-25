package com.isport.backend.repository;

import com.isport.backend.entity.Event;
import com.isport.backend.entity.EventStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface EventRepository extends JpaRepository<Event, Long> {
    List<Event> findByCreatorId(Long creatorId);
    List<Event> findByStatus(EventStatus status);
}
