package com.dwmarcuskim.resource;

import jakarta.annotation.Priority;
import jakarta.ws.rs.Priorities;
import jakarta.ws.rs.container.ContainerRequestContext;
import jakarta.ws.rs.container.ContainerRequestFilter;
import jakarta.ws.rs.container.ContainerResponseContext;
import jakarta.ws.rs.container.ContainerResponseFilter;
import jakarta.ws.rs.core.Response;
import jakarta.ws.rs.ext.Provider;

import java.io.IOException;

@Provider
@Priority(Priorities.AUTHENTICATION)
public class CorsFilter implements ContainerRequestFilter, ContainerResponseFilter {

    private static final String ALLOW_ORIGIN = "*";
    private static final String ALLOW_METHODS = "GET, POST, PUT, DELETE, OPTIONS, HEAD";
    private static final String ALLOW_HEADERS = "origin, content-type, accept, authorization";
    private static final String MAX_AGE = "86400"; // 24h

    @Override
    public void filter(ContainerRequestContext requestContext) throws IOException {
        // Handle CORS preflight
        if ("OPTIONS".equalsIgnoreCase(requestContext.getMethod())) {
            Response response = Response.ok()
                    .header("Access-Control-Allow-Origin", ALLOW_ORIGIN)
                    .header("Access-Control-Allow-Methods", ALLOW_METHODS)
                    .header("Access-Control-Allow-Headers", ALLOW_HEADERS)
                    .header("Access-Control-Max-Age", MAX_AGE)
                    .build();
            requestContext.abortWith(response);
        }
    }

    @Override
    public void filter(ContainerRequestContext requestContext, ContainerResponseContext responseContext) throws IOException {
        responseContext.getHeaders().putSingle("Access-Control-Allow-Origin", ALLOW_ORIGIN);
        responseContext.getHeaders().putSingle("Access-Control-Allow-Methods", ALLOW_METHODS);
        responseContext.getHeaders().putSingle("Access-Control-Allow-Headers", ALLOW_HEADERS);
        responseContext.getHeaders().putSingle("Access-Control-Max-Age", MAX_AGE);
    }
}
