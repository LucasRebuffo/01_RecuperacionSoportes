def actualizar_archivo_seguimiento(input_data, archivo_excel):
    """
    Actualiza el archivo de seguimiento con los datos del input.
    Si ya existe una fila con la misma clave compuesta (tipo_docto + nro_docto),
    no hace nada (NO actualiza, NO sobreescribe absolutamente ninguna columna de ninguna fila existente).
    Solo inserta los registros nuevos.
    """

    import pandas as pd
    import os
    from VortexLibrary import logger

    logger.log_path = "{gblRutaLogs}"
    logger.task = tmp_global_obj["profile"]["name"]

    try:
        # Intentar leer el archivo Excel existente
        if os.path.exists(archivo_excel):
            try:
                # Leer el archivo Excel con pandas
                df_existente = pd.read_excel(archivo_excel, header=0)
                # Filtrar solo las filas que tienen datos válidos (no NaN en empresa)
                df_existente = df_existente.dropna(subset=['empresa']).copy()

                # Normalizar nombres de columnas
                def normalizar_columna(col):
                    col = str(col).strip()
                    col = col.lower()
                    col = col.replace('\n', '_')
                    col = col.replace(' ', '_')
                    return col

                df_existente.columns = [normalizar_columna(col) for col in df_existente.columns]

                # Asegurar que todas las columnas necesarias existen
                columnas_requeridas = ['empresa', 'tipo_docto', 'nro_docto', 'detalle', 'documento_cruce', 'estado_procesamiento', 'fecha_procesamiento']
                for col in columnas_requeridas:
                    if col not in df_existente.columns:
                        df_existente[col] = ''
                logger.info(f"Archivo leído exitosamente: {len(df_existente)} filas de datos")

            except Exception as e:
                logger.error(f"Error al leer archivo existente: {e}")
                df_existente = pd.DataFrame(columns=[
                    'empresa', 'tipo_docto', 'nro_docto', 'detalle',
                    'documento_cruce', 'estado_procesamiento'
                ])
        else:
            logger.info("Archivo no existe, se creará uno nuevo")
            df_existente = pd.DataFrame(columns=[
                'empresa', 'tipo_docto', 'nro_docto', 'detalle',
                'documento_cruce', 'estado_procesamiento'
            ])

        # Convertir NaN a string vacío
        df_existente = df_existente.fillna('')

        logger.info(f"Archivo existente cargado: {len(df_existente)} filas")
        logger.info(f"Columnas: {list(df_existente.columns)}")

        # Convertir input_data a DataFrame
        df_nuevo = pd.DataFrame(input_data)
        logger.info(f"Datos de entrada: {len(df_nuevo)} filas")
        logger.info(f"Columnas entrada: {list(df_nuevo.columns)}")

        # Crear clave compuesta para identificar filas existentes
        df_existente['clave_compuesta'] = df_existente['tipo_docto'].astype(str) + '_' + df_existente['nro_docto'].astype(str)
        df_nuevo['clave_compuesta'] = df_nuevo['tipo_docto'].astype(str) + '_' + df_nuevo['nro_docto'].astype(str)

        # Filas a agregar (nuevas, es decir, las que NO existen en el archivo)
        filas_nuevas = df_nuevo[~df_nuevo['clave_compuesta'].isin(df_existente['clave_compuesta'])]
        logger.info(f"Filas nuevas a agregar: {len(filas_nuevas)}")

        # Agregar filas nuevas
        if len(filas_nuevas) > 0:
            # Eliminar la columna clave_compuesta antes de concatenar
            filas_nuevas_clean = filas_nuevas.drop('clave_compuesta', axis=1)
            df_existente = pd.concat([df_existente, filas_nuevas_clean], ignore_index=True)
            logger.info(f"Agregadas {len(filas_nuevas)} filas nuevas")
        else:
            logger.info("No hay filas nuevas por agregar.")

        # Eliminar la columna clave_compuesta del resultado final
        if 'clave_compuesta' in df_existente.columns:
            df_existente = df_existente.drop('clave_compuesta', axis=1)

        # Guardar el archivo actualizado
        df_existente.to_excel(archivo_excel, index=False)

        logger.info(f"Archivo actualizado exitosamente: {archivo_excel}")
        logger.info(f"Total de filas en el archivo: {len(df_existente)}")

        SetVar("gblItemsAProcesar",df_existente.to_dict('records'))

    except Exception as e:
        logger.error(f"Error al actualizar el archivo: {str(e)}")
        SetVar("gblItemsAProcesar",[])

# Datos de entrada del ejemplo original
input_data = {gblDatosArchivoBase}

# Ejecutar la actualización
actualizar_archivo_seguimiento(input_data, "{gblRutaInput}"+"/Archivo de Seguimiento.xlsx")
