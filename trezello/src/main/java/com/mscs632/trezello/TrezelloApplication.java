package com.mscs632.trezello;

import jakarta.annotation.PostConstruct;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.validation.beanvalidation.LocalValidatorFactoryBean;

import java.util.TimeZone;

@SpringBootApplication
public class TrezelloApplication {

		public static void main(String[] args) {
			SpringApplication.run(TrezelloApplication.class, args);
		}

		@PostConstruct
		public void init() {
			TimeZone.setDefault(TimeZone.getTimeZone("UTC"));
		}
		@Bean
		public LocalValidatorFactoryBean validator() {
			return new LocalValidatorFactoryBean();
		}
	}
