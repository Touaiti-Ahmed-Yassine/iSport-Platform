package com.isport.backend.service;

import com.isport.backend.entity.Sport;
import com.isport.backend.repository.SportRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class SportService {

    private final SportRepository sportRepository;

    public SportService(SportRepository sportRepository) {
        this.sportRepository = sportRepository;
    }

    public List<Sport> getAllSports() {
        return sportRepository.findAll();
    }

    public Sport getSportById(Long id) {
        return sportRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Sport not found"));
    }

    public Sport createSport(Sport sport) {
        return sportRepository.save(sport);
    }

    public void deleteSport(Long id) {
        sportRepository.deleteById(id);
    }
}
