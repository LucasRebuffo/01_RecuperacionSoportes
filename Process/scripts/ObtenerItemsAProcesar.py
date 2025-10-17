def actualizar_archivo_seguimiento(input_data, archivo_excel, template_excel):
    """
    Actualiza el archivo de seguimiento con los datos del input.
    Si ya existe una fila con la misma clave compuesta (tipo_docto + nro_docto),
    no hace nada (NO actualiza, NO sobreescribe absolutamente ninguna columna de ninguna fila existente).
    Solo inserta los registros nuevos.
    Si el archivo no existe lo crea a partir de un template que tiene el estilo de tabla correcto.
    """

    import pandas as pd
    import os
    import shutil
    from VortexLibrary import logger

    logger.log_path = "{gblRutaLogs}"
    logger.task_name = tmp_global_obj["profile"]["name"]

    try:
        # Si el archivo de seguimiento NO existe, crearlo copiando el template con formato/tablas
        if not os.path.exists(archivo_excel):
            logger.info("El archivo de seguimiento no existe, se creará a partir del template: " + str(template_excel))
            if not os.path.exists(template_excel):
                logger.error(f"El archivo template '{template_excel}' no existe. No se puede crear el archivo de seguimiento.")
                SetVar("gblItemsAProcesar", [])
                return
            shutil.copyfile(template_excel, archivo_excel)
            logger.info(f"Archivo de seguimiento creado a partir del template: {archivo_excel}")

        # Leer el archivo Excel existente (ya sea creado recién o preexistente)
        try:
            df_existente = pd.read_excel(archivo_excel, header=0)
            # Filtrar solo las filas que tienen datos válidos (no NaN en empresa)
            if 'empresa' in df_existente.columns:
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
            # Si hay problema leyendo la "estructura", crearla vacía usando el template
            df_existente = pd.DataFrame(columns=[
                'empresa', 'tipo_docto', 'nro_docto', 'detalle',
                'documento_cruce', 'estado_procesamiento', 'fecha_procesamiento'
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
            # Normalizar columnas por si el orden difiere
            for col in df_existente.columns:
                if col not in filas_nuevas_clean.columns:
                    filas_nuevas_clean[col] = ''
            filas_nuevas_clean = filas_nuevas_clean[df_existente.columns]  # orden y presencia
            df_existente = pd.concat([df_existente, filas_nuevas_clean], ignore_index=True)
            logger.info(f"Agregadas {len(filas_nuevas)} filas nuevas")
        else:
            logger.info("No hay filas nuevas por agregar.")

        # Eliminar la columna clave_compuesta del resultado final
        if 'clave_compuesta' in df_existente.columns:
            df_existente = df_existente.drop('clave_compuesta', axis=1)

        # Guardar el archivo actualizado. Esta acción NO altera el estilo/tabla porque el archivo fue creado desde template.
        # Para evitar perder el formato de tabla, usar openpyxl para guardar solo los datos sobre el template si se agregaron filas nuevas.
        try:
            import openpyxl
            from openpyxl.utils.dataframe import dataframe_to_rows

            # Abrir el archivo existente (con formato tipo tabla)
            wb = openpyxl.load_workbook(archivo_excel)
            ws = wb.active

            # Buscar el encabezado (asume desde la primera fila)
            header_row_idx = None
            first_row = [cell.value for cell in ws[1]]
            # Normalizar nombre de columnas del excel
            def norm(x):
                return str(x).strip().lower().replace('\n', '_').replace(' ', '_') if x else ''
            normalized_header = [norm(x) for x in first_row]
            excel_cols = normalized_header
            expected_first_col = 'empresa'
            # Encontrar fila header (flexible)
            for row in ws.iter_rows(min_row=1, max_col=1):
                if norm(row[0].value) == expected_first_col:
                    header_row_idx = row[0].row
                    break
            if not header_row_idx:
                header_row_idx = 1 # Fallback: primera fila
            data_start_idx = header_row_idx + 1

            # Borrar todas las filas de datos debajo de header
            max_row = ws.max_row
            if max_row >= data_start_idx:
                ws.delete_rows(data_start_idx, max_row-data_start_idx+1)
            # Escribir nuevas filas (solo datos, sin header)
            # Ordenar columnas según el excel
            df_save = df_existente.copy()
            df_save = df_save[[col for col in excel_cols if col in df_save.columns]]  # solo columnas presentes en el excel
            # Llenar datos debajo del header
            for r_idx, row in enumerate(dataframe_to_rows(df_save, index=False, header=False), start=data_start_idx):
                for c_idx, value in enumerate(row, start=1):
                    ws.cell(row=r_idx, column=c_idx, value=value)
            wb.save(archivo_excel)
        except Exception as ee:
            logger.warning(f"No se pudo sobrescribir el archivo con formato con openpyxl, se guarda solo el contenido plano: {str(ee)}")
            df_existente.to_excel(archivo_excel, index=False)

        logger.info(f"Archivo actualizado exitosamente: {archivo_excel}")
        logger.info(f"Total de filas en el archivo: {len(df_existente)}")

        SetVar("gblItemsAProcesar", df_existente.to_dict('records'))

    except Exception as e:
        logger.error(f"Error al actualizar el archivo: {str(e)}")
        SetVar("gblItemsAProcesar", [])

# Datos de entrada del ejemplo original
input_data = {gblDatosArchivoBase}
template_excel = "{gblRutaTemplates}/Template Archivo de Seguimiento.xlsx"

# Ejecutar la actualización
actualizar_archivo_seguimiento(input_data, "{gblRutaInput}"+"/Archivo de Seguimiento.xlsx", template_excel)
