package com.smartjewel.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.ObjectCannedACL;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;

import java.io.IOException;
import java.util.Objects;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class ImageUploadService {

    private final S3Client s3Client;

    @Value("${supabase.s3.endpoint:https://zdywhupfukoaiekrywcy.supabase.co/storage/v1/s3}")
    private String endpoint;

    @Value("${supabase.s3.bucket-name:product-images}")
    private String bucketName;

    public String uploadImage(MultipartFile file) {
        validateImageFile(file);

        String originalFilename = Objects.requireNonNullElse(file.getOriginalFilename(), "image.jpg");
        String extension = getFileExtension(originalFilename);
        String uniqueFilename = UUID.randomUUID() + (extension.isEmpty() ? ".jpg" : extension);

        try {
            PutObjectRequest putObjectRequest = PutObjectRequest.builder()
                    .bucket(bucketName)
                    .key(uniqueFilename)
                    .contentType(Objects.requireNonNullElse(file.getContentType(), "image/jpeg"))
                    .acl(ObjectCannedACL.PUBLIC_READ)
                    .build();

            s3Client.putObject(putObjectRequest, RequestBody.fromBytes(file.getBytes()));

            // URL pública gerada para salvar na coluna image_url da tabela products
            String publicUrl = String.format("%s/object/public/%s/%s", sanitizeUrl(endpoint), bucketName, uniqueFilename);
            log.info("Imagem enviada com sucesso para o Supabase S3 Storage. URL: {}", publicUrl);
            return publicUrl;

        } catch (IOException e) {
            log.error("Erro de I/O ao realizar upload da imagem para o Supabase S3 Storage", e);
            throw new RuntimeException("Erro ao comunicar com o serviço de armazenamento S3", e);
        } catch (Exception e) {
            log.error("Erro na API do Supabase S3 ao enviar o arquivo", e);
            throw new RuntimeException("Falha no upload para o Supabase S3: " + e.getMessage(), e);
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
        // Se a URL terminar com /s3 ou /s3/, remove para montar a URL pública do Supabase Storage
        String cleaned = url.endsWith("/") ? url.substring(0, url.length() - 1) : url;
        if (cleaned.endsWith("/storage/v1/s3")) {
            return cleaned.substring(0, cleaned.length() - "/s3".length());
        }
        return cleaned;
    }
}
