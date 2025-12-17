package com.dwmarcuskim.resource;

import com.dwmarcuskim.dto.Submission;
import com.dwmarcuskim.dto.SubmissionRequest;
import com.dwmarcuskim.repository.SubmissionRepository;
import jakarta.inject.Inject;
import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.eclipse.microprofile.config.inject.ConfigProperty;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.ByteArrayOutputStream;
import java.util.List;

@Path("/submit")
public class SubmissionResource {

    private static final Logger log = LoggerFactory.getLogger(SubmissionResource.class);
    @Inject
    SubmissionRepository repository;

    @ConfigProperty(name = "app.submit.password")
    String expectedPassword;

    @POST
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    public Response submit(SubmissionRequest req) {
        if (req == null || req.password == null || req.username == null || req.repeated == null || req.score == null) {
            return Response.status(Response.Status.BAD_REQUEST)
                    .entity("Missing required fields: password, username, repeated, score")
                    .build();
        }
        if (!req.password.equals(expectedPassword)) {
            return Response.status(Response.Status.UNAUTHORIZED).entity("Invalid password").build();
        }
        try {
            long id = repository.insert(req.username, req.repeated, req.score);
            return Response.ok(new SubmissionResponse(id)).build();
        } catch (Exception e) {
            log.error("Failed to save", e);
            return Response.serverError().entity("Failed to store submission").build();
        }
    }

    // simple inline response DTO
    public record SubmissionResponse(long id) {}

    @GET
    @Path("/export.xlsx")
    @Produces("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
    public Response exportExcel() {
        try {
            List<Submission> all = repository.findAll();

            try (XSSFWorkbook workbook = new XSSFWorkbook();
                 ByteArrayOutputStream out = new ByteArrayOutputStream()) {
                Sheet sheet = workbook.createSheet("submissions");

                // Header
                Row header = sheet.createRow(0);
                String[] headers = {"id", "username", "repeated", "score"};
                for (int i = 0; i < headers.length; i++) {
                    Cell cell = header.createCell(i);
                    cell.setCellValue(headers[i]);
                }

                // Rows
                int r = 1;
                for (Submission s : all) {
                    Row row = sheet.createRow(r++);
                    row.createCell(0).setCellValue(s.id());
                    row.createCell(1).setCellValue(s.username());
                    row.createCell(2).setCellValue(s.repeated());
                    row.createCell(3).setCellValue(s.score());
                }

                // Autosize columns
                for (int i = 0; i < 4; i++) {
                    sheet.autoSizeColumn(i);
                }

                workbook.write(out);
                byte[] bytes = out.toByteArray();

                return Response.ok(bytes)
                        .header("Content-Disposition", "attachment; filename=submissions.xlsx")
                        .build();
            }
        } catch (Exception e) {
            log.error("Failed to export", e);
            return Response.serverError().entity("Failed to export Excel").build();
        }
    }
}
