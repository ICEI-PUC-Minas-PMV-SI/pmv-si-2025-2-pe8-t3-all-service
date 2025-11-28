package br.com.allservice;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

@SpringBootApplication
@EnableJpaAuditing
public class AllserviceApplication {

	public static void main(String[] args) {
		SpringApplication.run(AllserviceApplication.class, args);
	}

}
