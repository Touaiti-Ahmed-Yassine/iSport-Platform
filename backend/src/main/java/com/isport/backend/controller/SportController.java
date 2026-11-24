package com.isport.backend.controller;

import com.isport.backend.entity.Sport;
import com.isport.backend.service.SportService;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/sports")
public class SportController {

    private final SportService sportService;

    public SportController(SportService sportService) {
        this.sportService = sportService;
    }

    @GetMapping
    public List<Sport> getAllSports() {
        return sportService.getAllSports();
    }

    @GetMapping("/{id}")
    public Sport getSportById(@PathVariable Long id) {
        return sportService.getSportById(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Sport createSport(@RequestBody Sport sport) {
        return sportService.createSport(sport);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteSport(@PathVariable Long id) {
        sportService.deleteSport(id);
    }
}
