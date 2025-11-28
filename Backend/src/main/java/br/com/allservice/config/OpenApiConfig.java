package br.com.allservice.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import io.swagger.v3.oas.models.security.SecurityRequirement;

@Configuration
public class OpenApiConfig {

	
	@Bean
	public OpenAPI customOpenAPI() {
		return new OpenAPI()
				.info(new Info()
						.title("API AllService")
						.version("v1")
						.description("")
						.termsOfService("")
						.license(
								new License()
									.name("Apache 2.0")
									.url("")));
//				.addSecurityItem(new SecurityRequirement()
//						.addList("Bearer Authentication"))
//						.components(new Components()
//								.addSecuritySchemes("Bearer Authentication", createAPIKeyScheme()));
	}
}
