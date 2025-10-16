import pandas as pd
import os
import re
import unicodedata

global normalizar_columna

from VortexLibrary import logger 
logger.log_path = "{gblRutaLogs}"
logger.task = tmp_global_obj["profile"]["name"]

# Nombre del archivo
archivo = "{loc016RutaArchivoDescargado}"

# Verificar que el archivo existe
if not os.path.exists(archivo):
    logger.warning(f"Error: El archivo '{archivo}' no existe en el directorio actual.")
    SetVar("gblDatosArchivoBase",[])

# Leer el archivo Excel
df = pd.read_excel(
    archivo,
    header=3,  # Linea 4 como cabecera (indice 3)
    usecols=['Empresa', 'Tipo\nDocto', 'Nro\nDocto', 'Detalle', 'DOCUMENTO CRUCE']
)

# Normalizar nombres de columnas y quitar tildes
def normalizar_columna(col):
    col = col.strip()
    col = col.lower()
    # Quitar tildes
    col = ''.join(
        c for c in unicodedata.normalize('NFD', col)
        if unicodedata.category(c) != 'Mn'
    )
    col = re.sub(r'\s+', '_', col)
    col = re.sub(r'[^\w_]', '', col)
    return col

df.columns = [normalizar_columna(col) for col in df.columns]

# Agregar columna de fecha de procesamiento si no existe
if 'fecha_procesamiento' not in df.columns:
    df['fecha_procesamiento'] = ''

# Agregar columna 'estado_procesamiento' al final
df['estado_procesamiento'] = 'Pendiente'

# Convertir los NaN a string vacio
df = df.fillna('')

# --- INICIO FILTRO SOLICITADO ---

# Filtrar los registros según condiciones sobre 'tipo_docto':
# - Descartar: Donde 'tipo_docto' tenga más de 2 letras (alfabéticas).
# - Descartar: Donde 'tipo_docto' contenga "NQ" (en cualquier posición y sin distinguir mayúsculas).
if 'tipo_docto' in df.columns:
    def filtro_tipo_docto(valor):
        # Convierte a string por si acaso
        s = str(valor)
        # Quitar espacios y convertir a mayúsculas para buscar "NQ"
        s_strip = s.replace(" ", "").upper()
        # Contar letras para la condición de longitud (sin contar digitos ni signos)
        letras = ''.join([c for c in s if c.isalpha()])
        # Condición 1: más de dos letras
        if len(letras) > 2:
            return False
        # Condición 2: contiene "NQ"
        if "NQ" in s_strip:
            return False
        return True

    original_count = len(df)
    df = df[df['tipo_docto'].apply(filtro_tipo_docto)].reset_index(drop=True)
    logger.info(f"Filtrado por tipo_docto: de {original_count:,} a {len(df):,} filas.")

# --- FIN FILTRO SOLICITADO ---

logger.info(f"Archivo leido exitosamente: {archivo}")
logger.info(f"Dimensiones del DataFrame: {df.shape}")
logger.info(f"Columnas extraidas: {list(df.columns)}")

# Mostrar informacion basica
logger.info(f"RESUMEN DE DATOS:")
logger.info(f"   Total de filas: {len(df):,}")
logger.info(f"   Total de columnas: {len(df.columns)}")

# Mostrar valores nulos
logger.info(f"VALORES NULOS POR COLUMNA:")
nulos = df.isnull().sum()
for col, nulos_count in nulos.items():
    porcentaje = (nulos_count / len(df)) * 100
    logger.info(f"   {col}: {nulos_count:,} ({porcentaje:.1f}%)")

# Mostrar estadisticas por columna
logger.info(f"ESTADISTICAS POR COLUMNA:")
for col in df.columns:
    valores_unicos = df[col].nunique()
    logger.info(f"   {col}: {valores_unicos:,} valores unicos")

# Mostrar primeras filas
logger.info(f"PRIMERAS 5 FILAS:\n{df.head().to_string()}")

# SetVar("gblDatosArchivoBase",df.to_records(index=False).tolist())
SetVar("gblDatosArchivoBase",df.to_dict(orient='records'))
