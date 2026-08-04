package com.smartjewel;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@EnableScheduling
@SpringBootApplication
public class SmartJewelApplication {

    public static void main(String[] args) {
        SpringApplication.run(SmartJewelApplication.class, args);
    }
}
