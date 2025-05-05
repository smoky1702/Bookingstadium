package com.example.bookingStadium.service;

import com.fasterxml.jackson.databind.JsonNode;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.Optional;

@Service
public class GoongMapService {
    @Value("${goong.api.key}")
    private String apiKey;

    @Value("${goong.geocode.url}")
    private String geocodeUrl;

    @Autowired
    private RestTemplate restTemplate;

    // Còn lỗi

    public Optional<LatLng> getCoordinates(String fullAddress) {
        try {
            String encodedAddress = URLEncoder.encode(fullAddress, StandardCharsets.UTF_8);
            String url = String.format("%s?address=%s&api_key=%s", geocodeUrl, encodedAddress, apiKey);

            ResponseEntity<JsonNode> response = restTemplate.getForEntity(url, JsonNode.class);
            if (response.getStatusCode().is2xxSuccessful()) {
                JsonNode results = response.getBody().get("results");
                if (results != null && results.isArray() && results.size() > 0) {
                    JsonNode location = results.get(0).get("geometry").get("location");
                    double lat = location.get("lat").asDouble();
                    double lng = location.get("lng").asDouble();
                    return Optional.of(new LatLng(lat, lng));
                }
            }
        } catch (Exception e) {
            e.printStackTrace();
        }

        return Optional.empty();
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class LatLng {
        private Double latitude;
        private Double longitude;
    }
}
