global logger

from VortexLibrary import logger

logger.log_path = "{gblRutaLogs}"
logger.task_name = tmp_global_obj["profile"]["name"]

def actualizar_fila_especifica(input_data, archivo_excel):
    """
    Actualiza una fila específica en el archivo de seguimiento basándose en la clave compuesta
    (tipo_docto + nro_docto) y agrega una columna de fecha de procesamiento.
    
    Args:
        input_data (dict): Diccionario con los datos a actualizar
        archivo_excel (str): Ruta del archivo Excel a actualizar
    """
    import pandas as pd
    import os
    from datetime import datetime

    try:
        # Verificar que el archivo existe
        if not os.path.exists(archivo_excel):
            logger.error(f"Error: El archivo '{archivo_excel}' no existe.")
            raise Exception(f"Error: El archivo '{archivo_excel}' no existe.")

        # Leer el archivo Excel existente
        df = pd.read_excel(archivo_excel, header=0)
        
        # Filtrar solo las filas que tienen datos válidos (no NaN en empresa)
        df = df.dropna(subset=['empresa']).copy()

        # Normalizar nombres de columnas
        def normalizar_columna(col):
            col = str(col).strip()
            col = col.lower()
            col = col.replace('\n', '_')
            col = col.replace(' ', '_')
            return col

        df.columns = [normalizar_columna(col) for col in df.columns]

        # Asegurar que todas las columnas necesarias existen
        columnas_requeridas = ['empresa', 'tipo_docto', 'nro_docto', 'detalle', 'documento_cruce', 'estado_procesamiento']
        for col in columnas_requeridas:
            if col not in df.columns:
                df[col] = ''

        # Convertir NaN a string vacío
        df = df.fillna('')

        logger.info(f"Archivo cargado: {len(df)} filas")
        logger.info(f"Columnas disponibles: {list(df.columns)}")

        # Crear clave compuesta para identificar la fila a actualizar
        clave_buscar = str(input_data['tipo_docto']) + '_' + str(input_data['nro_docto'])
        df['clave_compuesta'] = df['tipo_docto'].astype(str) + '_' + df['nro_docto'].astype(str)

        # Buscar la fila que coincide con la clave
        fila_encontrada = df[df['clave_compuesta'] == clave_buscar]
        
        logger.info(f"Fila encontrada: {fila_encontrada}")
        
        if len(fila_encontrada) == 0:
            logger.warning(f"No se encontró ninguna fila con la clave: {clave_buscar}")
            logger.info("Claves disponibles en el archivo:")
            for idx, clave in enumerate(df['clave_compuesta'].unique()[:10]):  # Mostrar solo las primeras 10
                logger.info(f"  {idx+1}. {clave}")
            return False

        if len(fila_encontrada) > 1:
            logger.warning(f"Se encontraron múltiples filas con la clave: {clave_buscar}")
            return False

        # Obtener el índice de la fila a actualizar
        indice_fila = fila_encontrada.index[0]
        
        logger.info(f"Fila encontrada en índice: {indice_fila}")
        logger.info(f"Datos actuales de la fila:")
        for col in columnas_requeridas:
            logger.info(f"  {col}: {df.loc[indice_fila, col]}")

        # Actualizar la fila con los nuevos datos
        for columna, valor in input_data.items():
            if columna in df.columns:
                df.loc[indice_fila, columna] = valor
                logger.info(f"Actualizado {columna}: {valor}")

        # Agregar columna de fecha de procesamiento si no existe
        if 'fecha_procesamiento' not in df.columns:
            df['fecha_procesamiento'] = ''

        # Actualizar la fecha de procesamiento
        fecha_actual = datetime.now().strftime("%d-%m-%Y %H:%M:%S")
        df.loc[indice_fila, 'fecha_procesamiento'] = fecha_actual

        # Eliminar la columna temporal clave_compuesta
        df = df.drop('clave_compuesta', axis=1)

        # Guardar el archivo actualizado
        df.to_excel(archivo_excel, index=False)

        logger.info(f"Archivo actualizado exitosamente: {archivo_excel}")
        logger.info(f"Fecha de procesamiento: {fecha_actual}")
        logger.info(f"Total de filas en el archivo: {len(df)}")


    except Exception as e:
        logger.error(f"Error al actualizar la fila: {str(e)}")
        raise e

# Datos de entrada del ejemplo
input_data = {gblItemActual}

# Ejecutar la actualización
resultado = actualizar_fila_especifica(input_data, "{gblRutaInput}"+"/Archivo de Seguimiento.xlsx")

logger.info("Actualización completada exitosamente")
