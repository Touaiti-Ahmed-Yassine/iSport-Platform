package com.isport.backend.repository;

import com.isport.backend.entity.Event;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@Repository
public interface EventRepository extends JpaRepository<Event, Long> {

    @Query("""
            select e from Event e
            where e.date > :today
               or (e.date = :today and e.heure >= :now)
            order by e.date asc, e.heure asc
            """)
    List<Event> findUpcoming(@Param("today") LocalDate today,
                             @Param("now") LocalTime now);
}