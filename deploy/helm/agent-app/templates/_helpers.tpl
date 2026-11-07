{{- define "agent-app.fullname" -}}
{{- .Release.Name | trunc 63 | trimSuffix "-" -}}
{{- end -}}

{{- define "agent-app.labels" -}}
app.kubernetes.io/name: agent-app
app.kubernetes.io/instance: {{ .Release.Name }}
app.kubernetes.io/part-of: agent-app
{{- end -}}

{{- define "agent-app.requireSafeValues" -}}
{{- if not .Values.database.existingSecret }}
{{- fail "database.existingSecret is required. This chart does not create credentials." }}
{{- end }}
{{- if not .Values.api.env.betterAuthUrl }}
{{- fail "api.env.betterAuthUrl is required" }}
{{- end }}
{{- if not .Values.api.env.trustedOrigins }}
{{- fail "api.env.trustedOrigins is required" }}
{{- end }}
{{- if and .Values.ingress.enabled (not .Values.ingress.host) }}
{{- fail "ingress.host is required when ingress is enabled" }}
{{- end }}
{{- end -}}
