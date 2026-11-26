
package com.isport.backend.config;

import com.isport.backend.entity.Sport;
import com.isport.backend.repository.SportRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class SportDataInitializer {

    @Bean
    CommandLineRunner initializeSports(SportRepository sportRepository) {
        return args -> {
            String[] sports = {
                "Basketball",
                "Football",
                "Volleyball",
                "Ultimate"
            };

            for (String name : sports) {
                if (!sportRepository.existsByNameIgnoreCase(name)) {
                    sportRepository.save(new Sport(name));
                }
            }
        };
    }
}
