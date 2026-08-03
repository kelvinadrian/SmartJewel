package com.smartjewel.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.Objects;
import java.util.UUID;

@Slf4j
@Service
public class ImageUploadService {

    @Value("${supabase.url}")
    private String supabaseUrl;

    @Value("${supabase.key}")
    private String supabaseKey;

    @Value("${supabase.bucket:product-images}")
    private String bucket;

    private final HttpClient httpClient = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(10))
            .build();

    public String uploadImage(MultipartFile file) {
        validateImageFile(file);

        String originalFilename = Objects.requireNonNullElse(file.getOriginalFilename(), "image.jpg");
        String extension = getFileExtension(originalFilename);
        String uniqueFilename = UUID.randomUUID() + (extension.isEmpty() ? ".jpg" : extension);

        String uploadUrl = String.format("%s/storage/v1/object/%s/%s", sanitizeUrl(supabaseUrl), bucket, uniqueFilename);

        try {
            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(uploadUrl))
                    .header("Authorization", "Bearer " + supabaseKey)
                    .header("apiKey", supabaseKey)
                    .header("Content-Type", Objects.requireNonNullElse(file.getContentType(), "image/jpeg"))
                    .header("x-upsert", "true")
                    .POST(HttpRequest.BodyPublishers.ofByteArray(file.getBytes()))
                    .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());

            if (response.statusCode() >= 200 && response.statusCode() < 300) {
                String publicUrl = String.format("%s/storage/v1/object/public/%s/%s", sanitizeUrl(supabaseUrl), bucket, uniqueFilename);
                log.info("Imagem enviada com sucesso para o Supabase Storage. URL: {}", publicUrl);
                return publicUrl;
            } else {
                log.error("Erro ao enviar imagem para o Supabase Storage. Status: {}, Body: {}", response.statusCode(), response.body());
                throw new RuntimeException("Falha ao realizar upload da imagem no Supabase Storage: " + response.body());
            }

        } catch (IOException | InterruptedException e) {
            log.error("Erro de I/O ao realizar upload da imagem para o Supabase Storage", e);
            Thread.currentThread().interrupt();
            throw new RuntimeException("Erro ao comunicar com o serviço de armazenamento de imagens", e);
        }
    }

    private void validateImageFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("O arquivo de imagem não pode ser vazio");
        }

        String contentType = file.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
            throw new IllegalArgumentException("O arquivo enviado não é uma imagem válida (ContentType: " + contentType + ")");
        }
    }

    private String getFileExtension(String filename) {
        int lastIndex = filename.lastIndexOf('.');
        if (lastIndex > 0 && lastIndex < filename.length() - 1) {
            return filename.substring(lastIndex);
        }
        return "";
    }

    private String sanitizeUrl(String url) {
        if (url == null) return "";
        return url.endsWith("/") ? url.substring(0, url.length() - 1) : url;
    }
}
