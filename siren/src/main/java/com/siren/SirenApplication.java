package com.siren;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class SirenApplication {
	public static void main(String[] args) {
		SpringApplication.run(SirenApplication.class, args);
		System.out.println("🚨 SIREN Application Started! Listening for audio uploads...");

	}

}
