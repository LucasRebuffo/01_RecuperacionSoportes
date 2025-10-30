diccNotificaciones = {gblDicNotificaciones}
# Asignar el correo de monitoreo como copia oculta
ccoDestinatarios = "rpa.vortex@gmail.com"

# Obtener datos y parametros generales
nombreProceso = "{gblNombreProceso}"
nombreBot = "Prueba"
fechaProceso = "{gblFechaHoy}"
htmlTemplate = """{gblHtmlTemplate}"""
tipoNotificacion = "{gblTipoNotificacion}"


# Obtener valores de la configuracion
destinatarios = diccNotificaciones[tipoNotificacion]['Destinatarios']
asunto = diccNotificaciones[tipoNotificacion]['Asunto'].strip().replace("\n","")
cuerpo = diccNotificaciones[tipoNotificacion]['Cuerpo'].strip()
adjunto = ''

# Reemplazar por saltos de linea html
cuerpo = cuerpo.replace("\n","<br>")

# Reemplazar parametros generales o de uso frecuente
asunto = asunto.replace("NombreProceso",nombreProceso).replace("[Fecha]",fechaProceso)
cuerpo = cuerpo.replace("[Mensaje]","""{gblMensajeError}""")

# Reemplazar parametros especificos de cada tipo de notificacion
if tipoNotificacion == "FALLA-RESOLUCION":
  cuerpo = cuerpo.replace("[ResolucionActual]","{locResolucionActual}").replace("[ResolucionesDisponibles]","{locResolucionesPermitidas}")

elif tipoNotificacion == "FALLO EN TRATAMIENTO DE ITEM":
  cuerpo = cuerpo.replace("[NroDoc]","{gblNroDoc}").replace("[TipoDoc]","{gblTipoDoc}")

elif tipoNotificacion == "FIN":
  adjunto = "{gblRutaLogs}"

elif tipoNotificacion == "REPORTE":
  adjunto = "{gblRutaReporte}"

# Ingresar el cuerpo en el template
htmlMail = htmlTemplate.replace("%Body%",cuerpo).replace("[NombreProceso]",nombreProceso).replace("[NombreBot]",nombreBot)

SetVar("locAsuntoMail", asunto)
SetVar("locAdjuntoMail", adjunto)
SetVar("locCuerpoMail",htmlMail)
SetVar("locDestinatariosMail",destinatarios)
SetVar("locCcoDeveloper",ccoDestinatarios)