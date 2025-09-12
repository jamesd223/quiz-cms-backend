import {
  OpenAPIRegistry,
  OpenApiGeneratorV31,
  extendZodWithOpenApi,
} from "@asteasolutions/zod-to-openapi";
import { z } from "zod";
extendZodWithOpenApi(z);
import {
  mediaSchema,
  brandSchema,
  quizSchema,
  quizVersionSchema,
  stepSchema,
  fieldSchema,
  optionSchema,
  groupedInputSchema,
  submissionSchema,
  userSchema,
} from "./validators/index.js";

export function buildOpenAPIDocument(baseUrl = "http://localhost:3000"): any {
  const registry = new OpenAPIRegistry();

  // Components
  const Media = registry.register("Media", mediaSchema);
  const Brand = registry.register("Brand", brandSchema);
  const Quiz = registry.register("Quiz", quizSchema);
  const QuizVersion = registry.register("QuizVersion", quizVersionSchema);
  const Step = registry.register("Step", stepSchema);
  const Field = registry.register("Field", fieldSchema);
  const Option = registry.register("Option", optionSchema);
  const GroupedInput = registry.register("GroupedInput", groupedInputSchema);
  const Submission = registry.register("Submission", submissionSchema);
  const User = registry.register("User", userSchema);

  // Security schemes components
  registry.registerComponent("securitySchemes", "bearerAuth", {
    type: "http",
    scheme: "bearer",
    bearerFormat: "JWT",
  } as any);
  registry.registerComponent("securitySchemes", "refreshCookie", {
    type: "apiKey",
    in: "cookie",
    name: "refresh_token",
  } as any);

  // DTOs for admin create/update
  const BrandCreate = registry.register(
    "BrandCreate",
    brandSchema.pick({ name: true })
  );
  const QuizCreate = registry.register(
    "QuizCreate",
    quizSchema.pick({
      brand_id: true,
      slug: true,
      title: true,
      subtitle: true,
      locale_default: true,
      progress_style: true,
      show_trust_strip: true,
      show_seen_on: true,
      status: true,
    })
  );
  const QuizUpdate = registry.register("QuizUpdate", quizSchema.partial());
  const VersionCreate = registry.register(
    "VersionCreate",
    quizVersionSchema.pick({
      quiz_id: true,
      label: true,
      traffic_weight: true,
      is_default: true,
    })
  );
  const VersionUpdate = registry.register(
    "VersionUpdate",
    quizVersionSchema.partial()
  );
  const StepCreate = registry.register(
    "StepCreate",
    stepSchema.pick({
      quiz_version_id: true,
      order_index: true,
      is_visible: true,
      title: true,
      description: true,
      footnote_text: true,
      cta_text: true,
      layout: true,
      media_id: true,
      grid_columns: true,
      grid_rows: true,
      grid_gap_px: true,
    })
  );
  const StepUpdate = registry.register("StepUpdate", stepSchema.partial());
  const FieldCreate = registry.register(
    "FieldCreate",
    fieldSchema.pick({
      step_id: true,
      order_index: true,
      is_visible: true,
      key: true,
      label: true,
      help_text: true,
      type: true,
      required: true,
      placeholder: true,
      input_mask: true,
      min: true,
      max: true,
      unit: true,
      validation_regex: true,
      validation_message: true,
      row_index: true,
      col_index: true,
      row_span: true,
      col_span: true,
      container_layout_mode: true,
      container_grid_columns: true,
      container_grid_rows: true,
      container_gap_px: true,
      randomize_options: true,
      value_format: true,
      default_value: true,
    })
  );
  const FieldUpdate = registry.register("FieldUpdate", fieldSchema.partial());
  const OptionCreate = registry.register(
    "OptionCreate",
    optionSchema.pick({
      field_id: true,
      order_index: true,
      is_visible: true,
      label: true,
      description: true,
      value: true,
      icon_media_id: true,
      image_media_id: true,
      is_default: true,
      score: true,
      row_index: true,
      col_index: true,
      row_span: true,
      col_span: true,
    })
  );
  const OptionUpdate = registry.register(
    "OptionUpdate",
    optionSchema.partial()
  );
  const GroupedInputCreate = registry.register(
    "GroupedInputCreate",
    groupedInputSchema.pick({
      field_id: true,
      order_index: true,
      is_visible: true,
      field_key: true,
      label: true,
      input_type: true,
      unit: true,
      min: true,
      max: true,
      placeholder: true,
      required: true,
      row_index: true,
      col_index: true,
      row_span: true,
      col_span: true,
    })
  );
  const GroupedInputUpdate = registry.register(
    "GroupedInputUpdate",
    groupedInputSchema.partial()
  );

  // Security Schemes
  const securitySchemes = {
    bearerAuth: {
      type: "http",
      scheme: "bearer",
      bearerFormat: "JWT" as const,
    },
    refreshCookie: {
      type: "apiKey" as const,
      in: "cookie" as const,
      name: "refresh_token",
    },
  };

  const AssembledQuiz = registry.register(
    "AssembledQuiz",
    z.object({
      quiz: Quiz,
      version: QuizVersion,
      steps: z.array(Step),
      fields: z.array(Field),
      options: z.array(Option),
      grouped_inputs: z.array(GroupedInput),
      media: z.array(Media).optional(),
    })
  );

  // Paths
  const authed = [{ bearerAuth: [] as string[] }];
  registry.registerPath({
    method: "get",
    path: "/v1/quizzes/{slug}",
    summary: "Get assembled quiz by slug",
    request: {
      params: z.object({ slug: z.string() }),
      query: z.object({
        version: z.string().optional(),
        seed: z.string().optional(),
      }),
    },
    responses: {
      200: {
        description: "Assembled quiz",
        content: { "application/json": { schema: AssembledQuiz } },
      },
    },
  });

  registry.registerPath({
    method: "get",
    path: "/v1/quizzes/{id}/versions",
    summary: "List versions for a quiz",
    request: { params: z.object({ id: z.string() }) },
    responses: {
      200: {
        description: "Versions",
        content: {
          "application/json": {
            schema: z.object({
              items: z.array(
                z.object({
                  label: z.string(),
                  traffic_weight: z.number().int(),
                  is_default: z.boolean(),
                })
              ),
            }),
          },
        },
      },
    },
  });

  // Admin Brands
  registry.registerPath({
    method: "get",
    path: "/v1/brands",
    summary: "List brands",
    security: authed,
    responses: { 200: { description: "OK" } },
  });
  registry.registerPath({
    method: "post",
    path: "/v1/brands",
    summary: "Create brand",
    security: authed,
    request: {
      body: {
        content: {
          "application/json": { schema: z.object({ name: z.string().min(1) }) },
        },
      },
    },
    responses: { 201: { description: "Created" } },
  });
  registry.registerPath({
    method: "patch",
    path: "/v1/brands/{id}",
    summary: "Update brand",
    security: authed,
    request: {
      params: z.object({ id: z.string() }),
      body: {
        content: {
          "application/json": {
            schema: z.object({ name: z.string().min(1) }).partial(),
          },
        },
      },
    },
    responses: { 200: { description: "OK" } },
  });

  // Admin Media
  registry.registerPath({
    method: "get",
    path: "/v1/media",
    summary: "List media",
    security: authed,
    responses: { 200: { description: "OK" } },
  });
  registry.registerPath({
    method: "post",
    path: "/v1/media",
    summary: "Upload media (multipart)",
    security: authed,
    request: {
      body: { content: { "multipart/form-data": { schema: z.any() } } },
    },
    responses: { 201: { description: "Created" } },
  });
  registry.registerPath({
    method: "delete",
    path: "/v1/media/{id}",
    summary: "Delete media",
    security: authed,
    request: { params: z.object({ id: z.string() }) },
    responses: { 204: { description: "No Content" } },
  });

  // Admin Quizzes
  registry.registerPath({
    method: "get",
    path: "/v1/quizzes",
    summary: "List quizzes",
    security: authed,
    responses: { 200: { description: "OK" } },
  });
  registry.registerPath({
    method: "post",
    path: "/v1/quizzes",
    summary: "Create quiz",
    security: authed,
    request: { body: { content: { "application/json": { schema: z.any() } } } },
    responses: { 201: { description: "Created" } },
  });
  registry.registerPath({
    method: "get",
    path: "/v1/quizzes/{id}",
    summary: "Get quiz",
    security: authed,
    request: { params: z.object({ id: z.string() }) },
    responses: { 200: { description: "OK" } },
  });
  registry.registerPath({
    method: "patch",
    path: "/v1/quizzes/{id}",
    summary: "Update quiz",
    security: authed,
    request: {
      params: z.object({ id: z.string() }),
      body: { content: { "application/json": { schema: z.any() } } },
    },
    responses: { 200: { description: "OK" } },
  });

  // Admin Versions
  registry.registerPath({
    method: "post",
    path: "/v1/versions",
    summary: "Create version",
    security: authed,
    request: { body: { content: { "application/json": { schema: z.any() } } } },
    responses: { 201: { description: "Created" } },
  });
  registry.registerPath({
    method: "patch",
    path: "/v1/versions/{id}",
    summary: "Update version",
    security: authed,
    request: {
      params: z.object({ id: z.string() }),
      body: { content: { "application/json": { schema: z.any() } } },
    },
    responses: { 200: { description: "OK" } },
  });
  registry.registerPath({
    method: "get",
    path: "/v1/versions/{id}",
    summary: "Get version by id",
    security: authed,
    request: { params: z.object({ id: z.string() }) },
    responses: {
      200: { description: "OK" },
      404: { description: "Not Found" },
    },
  });
  registry.registerPath({
    method: "get",
    path: "/v1/versions/quiz/{quizId}",
    summary: "List versions by quiz",
    security: authed,
    request: { params: z.object({ quizId: z.string() }) },
    responses: { 200: { description: "OK" } },
  });

  // Admin Steps
  registry.registerPath({
    method: "get",
    path: "/v1/steps/version/{versionId}",
    summary: "List steps by version",
    security: authed,
    request: { params: z.object({ versionId: z.string() }) },
    responses: { 200: { description: "OK" } },
  });
  registry.registerPath({
    method: "post",
    path: "/v1/steps",
    summary: "Create step",
    security: authed,
    request: { body: { content: { "application/json": { schema: z.any() } } } },
    responses: { 201: { description: "Created" } },
  });
  registry.registerPath({
    method: "patch",
    path: "/v1/steps/{id}",
    summary: "Update step",
    security: authed,
    request: {
      params: z.object({ id: z.string() }),
      body: { content: { "application/json": { schema: z.any() } } },
    },
    responses: { 200: { description: "OK" } },
  });
  registry.registerPath({
    method: "get",
    path: "/v1/steps/{id}",
    summary: "Get step by id",
    security: authed,
    request: { params: z.object({ id: z.string() }) },
    responses: {
      200: { description: "OK" },
      404: { description: "Not Found" },
    },
  });
  registry.registerPath({
    method: "delete",
    path: "/v1/steps/{id}",
    summary: "Delete step",
    security: authed,
    request: { params: z.object({ id: z.string() }) },
    responses: { 204: { description: "No Content" } },
  });

  // Admin Fields
  registry.registerPath({
    method: "get",
    path: "/v1/fields/step/{stepId}",
    summary: "List fields by step",
    security: authed,
    request: { params: z.object({ stepId: z.string() }) },
    responses: { 200: { description: "OK" } },
  });
  registry.registerPath({
    method: "get",
    path: "/v1/fields/{id}",
    summary: "Get field by id",
    security: authed,
    request: { params: z.object({ id: z.string() }) },
    responses: {
      200: { description: "OK" },
      404: { description: "Not Found" },
    },
  });
  registry.registerPath({
    method: "post",
    path: "/v1/fields",
    summary: "Create field",
    security: authed,
    request: { body: { content: { "application/json": { schema: z.any() } } } },
    responses: { 201: { description: "Created" } },
  });
  registry.registerPath({
    method: "patch",
    path: "/v1/fields/{id}",
    summary: "Update field",
    security: authed,
    request: {
      params: z.object({ id: z.string() }),
      body: { content: { "application/json": { schema: z.any() } } },
    },
    responses: { 200: { description: "OK" } },
  });
  registry.registerPath({
    method: "delete",
    path: "/v1/fields/{id}",
    summary: "Delete field",
    security: authed,
    request: { params: z.object({ id: z.string() }) },
    responses: { 204: { description: "No Content" } },
  });

  // Admin Options
  registry.registerPath({
    method: "get",
    path: "/v1/options/field/{fieldId}",
    summary: "List options by field",
    security: authed,
    request: { params: z.object({ fieldId: z.string() }) },
    responses: { 200: { description: "OK" } },
  });
  registry.registerPath({
    method: "post",
    path: "/v1/options",
    summary: "Create option",
    security: authed,
    request: { body: { content: { "application/json": { schema: z.any() } } } },
    responses: { 201: { description: "Created" } },
  });
  registry.registerPath({
    method: "patch",
    path: "/v1/options/{id}",
    summary: "Update option",
    security: authed,
    request: {
      params: z.object({ id: z.string() }),
      body: { content: { "application/json": { schema: z.any() } } },
    },
    responses: { 200: { description: "OK" } },
  });
  registry.registerPath({
    method: "delete",
    path: "/v1/options/{id}",
    summary: "Delete option",
    security: authed,
    request: { params: z.object({ id: z.string() }) },
    responses: { 204: { description: "No Content" } },
  });

  // Admin Grouped Inputs
  registry.registerPath({
    method: "get",
    path: "/v1/grouped-inputs/field/{fieldId}",
    summary: "List grouped inputs by field",
    security: authed,
    request: { params: z.object({ fieldId: z.string() }) },
    responses: { 200: { description: "OK" } },
  });
  registry.registerPath({
    method: "post",
    path: "/v1/grouped-inputs",
    summary: "Create grouped input",
    security: authed,
    request: { body: { content: { "application/json": { schema: z.any() } } } },
    responses: { 201: { description: "Created" } },
  });
  registry.registerPath({
    method: "patch",
    path: "/v1/grouped-inputs/{id}",
    summary: "Update grouped input",
    security: authed,
    request: {
      params: z.object({ id: z.string() }),
      body: { content: { "application/json": { schema: z.any() } } },
    },
    responses: { 200: { description: "OK" } },
  });
  registry.registerPath({
    method: "delete",
    path: "/v1/grouped-inputs/{id}",
    summary: "Delete grouped input",
    security: authed,
    request: { params: z.object({ id: z.string() }) },
    responses: { 204: { description: "No Content" } },
  });

  registry.registerPath({
    method: "post",
    path: "/v1/submissions",
    summary: "Create a submission",
    request: {
      body: { content: { "application/json": { schema: Submission } } },
    },
    responses: { 202: { description: "Accepted" } },
  });

  registry.registerPath({
    method: "post",
    path: "/v1/auth/login",
    summary: "Login",
    request: {
      body: {
        content: {
          "application/json": {
            schema: z.object({
              email: z.string().email(),
              password: z.string().min(1),
            }),
          },
        },
      },
    },
    responses: {
      200: {
        description: "OK",
        content: {
          "application/json": {
            schema: z.object({ access_token: z.string() }),
          },
        },
      },
    },
  });

  registry.registerPath({
    method: "post",
    path: "/v1/auth/refresh",
    summary: "Refresh",
    responses: { 200: { description: "OK" } },
  });
  registry.registerPath({
    method: "post",
    path: "/v1/auth/logout",
    summary: "Logout",
    responses: { 204: { description: "No Content" } },
  });

  const generator = new OpenApiGeneratorV31(registry.definitions);
  return generator.generateDocument({
    openapi: "3.1.0",
    info: { title: "Quiz CMS API", version: "1.0.0" },
    servers: [{ url: baseUrl }],
  });
}

// If executed directly, print JSON
if (process.argv[1] && process.argv[1].endsWith("openapi.ts")) {
  const doc = buildOpenAPIDocument();
  // eslint-disable-next-line no-console
  console.log(JSON.stringify(doc, null, 2));
}
