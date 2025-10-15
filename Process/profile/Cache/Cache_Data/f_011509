/**
 * ITALCOL Daily Support - Aplicación JavaScript
 * Lógica completa del lado del cliente usando localStorage para almacenamiento
 */

class ITALCOLApp {
    constructor() {
        this.config = window.CONFIG || CONFIG;
        this.db = null;
        this.stats = [];
        console.log('ITALCOLApp: constructor llamado');
        this.init();
    }

    async init() {
        console.log('Inicializando aplicación ITALCOL...');
        await this.initDatabase();
        await this.loadStats();
        this.setupEventListeners();
        this.renderStats();
    }

    async initDatabase() {
        // Uso exclusivo de localStorage
        this.db = {
            type: 'localStorage',
            execute: this.executeLocalStorage.bind(this)
        };

        // Inicializar localStorage si hace falta y crear tablas/estructura
        console.log('initDatabase: configurando localStorage como backend');
        this.initializeLocalStorage();
        await this.createTables();
        console.log('initDatabase: Base de datos localStorage inicializada correctamente');
    }

    async testConnection() {
        try {
            await this.db.execute('SELECT 1');
        } catch (error) {
            throw new Error('No se pudo acceder a localStorage: ' + error.message);
        }
    }


    async executeLocalStorage(sql, params = []) {
        // Simular SQL con localStorage
        let stats = JSON.parse(localStorage.getItem('italcol_stats') || '[]');
        
        if (sql.includes('CREATE TABLE')) {
            // Crear tabla (inicializar localStorage si no existe)
            this.initializeLocalStorage();
            return { rows: [] };
        }
        
        if (sql.includes('INSERT INTO')) {
            // Insertar nuevo registro con validación de datos
            const newRecord = {
                id: Date.now() + Math.random(), // ID único
                archivo: params[0] || 'archivo_desconocido',
                fecha_proceso: new Date().toISOString(),
                efectividad: parseFloat(params[1]) || 0,
                total_registros: parseInt(params[2]) || 0,
                proceso: params[3] || 'General'
            };
            
            // Validar que todos los campos requeridos estén presentes
            if (!newRecord.archivo || newRecord.archivo === 'archivo_desconocido') {
                console.warn('Advertencia: archivo no especificado en INSERT');
            }
            
            stats.unshift(newRecord);
            localStorage.setItem('italcol_stats', JSON.stringify(stats));
            console.log('Registro guardado en localStorage:', newRecord);
            return { rows: [] };
        }
        
        if (sql.includes('SELECT')) {
            // Retornar registros con validación
            let result = [...stats];
            
            // Filtrar registros de prueba si existen
            result = result.filter(record => record.archivo !== '__test_table_creation__');
            
            if (sql.includes('ORDER BY fecha_proceso DESC')) {
                result.sort((a, b) => new Date(b.fecha_proceso) - new Date(a.fecha_proceso));
            }
            
            if (sql.includes('LIMIT')) {
                const limitMatch = sql.match(/LIMIT (\d+)/);
                if (limitMatch) {
                    const limit = parseInt(limitMatch[1]);
                    result = result.slice(0, limit);
                }
            }
            
            console.log(`Retornando ${result.length} registros desde localStorage`);
            return { rows: result };
        }
        
        if (sql.includes('DELETE FROM')) {
            // Eliminar registros
            if (params.length > 0) {
                stats = stats.filter(record => record.archivo !== params[0]);
                localStorage.setItem('italcol_stats', JSON.stringify(stats));
            }
            return { rows: [] };
        }
        
        return { rows: [] };
    }

    async createTables() {
        try {
            const createTableSQL = `
                CREATE TABLE IF NOT EXISTS stats (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    archivo TEXT NOT NULL,
                    fecha_proceso TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    efectividad REAL NOT NULL,
                    total_registros INTEGER NOT NULL,
                    proceso TEXT NOT NULL DEFAULT 'General'
                )
            `;
            await this.db.execute(createTableSQL);
            console.log('createTables: tabla stats creada/verificada correctamente');
            
            // Verificar que la tabla existe consultando su estructura
            await this.verifyTableStructure();
            
        } catch (error) {
            console.error('Error creando tabla:', error);
            // Si falla, intentar crear la estructura en localStorage
            this.initializeLocalStorage();
        }
    }

    async verifyTableStructure() {
        try {
            // Intentar insertar un registro de prueba y luego eliminarlo
            const testData = {
                archivo: '__test_table_creation__',
                efectividad: 0,
                total_registros: 0,
                proceso: 'Test'
            };
            
            await this.db.execute(
                `INSERT INTO ${this.config.DATABASE.TABLE_NAME} (archivo, efectividad, total_registros, proceso) VALUES (?, ?, ?, ?)`,
                [testData.archivo, testData.efectividad, testData.total_registros, testData.proceso]
            );
            
            // Eliminar el registro de prueba
            await this.db.execute(
                `DELETE FROM ${this.config.DATABASE.TABLE_NAME} WHERE archivo = ?`,
                [testData.archivo]
            );
            
            console.log('Estructura de tabla verificada correctamente');
        } catch (error) {
            console.warn('No se pudo verificar la estructura de la tabla:', error);
            this.initializeLocalStorage();
        }
    }

    initializeLocalStorage() {
        // Inicializar localStorage con estructura correcta si no existe
        const existingData = localStorage.getItem('italcol_stats');
        if (!existingData) {
            localStorage.setItem('italcol_stats', JSON.stringify([]));
            console.log('initializeLocalStorage: localStorage inicializado con estructura vacía');
        } else {
            // Verificar y reparar estructura de datos existente
            this.repairLocalStorageData();
            console.log('initializeLocalStorage: localStorage ya existe con datos');
        }
    }

    repairLocalStorageData() {
        try {
            const data = JSON.parse(localStorage.getItem('italcol_stats') || '[]');
            let needsRepair = false;
            
            const repairedData = data.map(record => {
                // Asegurar que todos los campos requeridos existan
                const repairedRecord = {
                    id: record.id || Date.now() + Math.random(),
                    archivo: record.archivo || 'archivo_desconocido',
                    fecha_proceso: record.fecha_proceso || new Date().toISOString(),
                    efectividad: parseFloat(record.efectividad) || 0,
                    total_registros: parseInt(record.total_registros) || 0,
                    proceso: record.proceso || 'General'
                };
                
                // Verificar si el registro necesita reparación
                if (record.archivo === undefined || record.total_registros === undefined) {
                    needsRepair = true;
                }
                
                return repairedRecord;
            });
            
            if (needsRepair) {
                localStorage.setItem('italcol_stats', JSON.stringify(repairedData));
                console.log('repairLocalStorageData: Datos de localStorage reparados');
            }
        } catch (error) {
            console.error('Error reparando datos de localStorage:', error);
            // Si hay error, reinicializar
            localStorage.setItem('italcol_stats', JSON.stringify([]));
            console.log('repairLocalStorageData: localStorage reinicializado debido a error');
        }
    }

    async loadStats() {
        try {
            const maxRecords = this.config.DATABASE.MAX_RECORDS;
            const result = await this.db.execute(
                `SELECT archivo, fecha_proceso, efectividad, total_registros, proceso FROM ${this.config.DATABASE.TABLE_NAME} ORDER BY fecha_proceso DESC LIMIT ${maxRecords}`
            );
            // Normalizar claves: asegurar tanto totalRegistros (camelCase) como total_registros (snake_case)
            this.stats = (result.rows || []).map(r => {
                const totalVal = r.totalRegistros ?? r.total_registros ?? r.total ?? 0;
                return {
                    id: r.id,
                    archivo: r.archivo,
                    fecha_proceso: r.fecha_proceso ?? r.fechaProceso ?? new Date().toISOString(),
                    efectividad: parseFloat(r.efectividad) || 0,
                    totalRegistros: totalVal,
                    total_registros: totalVal,
                    proceso: r.proceso || 'General'
                };
            });
            console.log(`loadStats: cargados ${this.stats.length} registros (normalizados)`);
        } catch (error) {
            console.error('Error cargando estadísticas:', error);
            this.showError('Error cargando datos');
        }
    }

    async saveStats(archivo, efectividad, totalRegistros, proceso = 'General') {
        try {
            if (this.db && this.db.type === 'localStorage') {
                // Manejar directamente en localStorage para evitar duplicados
                let stats = JSON.parse(localStorage.getItem('italcol_stats') || '[]');
                const existingIndex = stats.findIndex(s => s.archivo === archivo);
                const newRecord = {
                    id: existingIndex >= 0 ? stats[existingIndex].id : (Date.now() + Math.random()),
                    archivo,
                    fecha_proceso: new Date().toISOString(),
                    efectividad: parseFloat(efectividad) || 0,
                    total_registros: parseInt(totalRegistros) || 0,
                    totalRegistros: parseInt(totalRegistros) || 0,
                    proceso: proceso || 'General'
                };

                if (existingIndex >= 0) {
                    stats[existingIndex] = newRecord;
                    console.log('saveStats: registro existente actualizado:', archivo);
                } else {
                    stats.unshift(newRecord);
                    console.log('saveStats: nuevo registro insertado:', archivo);
                }

                localStorage.setItem('italcol_stats', JSON.stringify(stats));
            } else {
                // Fallback: intentar insertar usando db.execute
                await this.db.execute(
                    `INSERT INTO ${this.config.DATABASE.TABLE_NAME} (archivo, efectividad, total_registros, proceso) VALUES (?, ?, ?, ?)`,
                    [archivo, efectividad, totalRegistros, proceso]
                );
            }

            await this.loadStats(); // Recargar datos
            this.renderStats();
        } catch (error) {
            console.error('Error guardando estadística:', error);
            this.showError('Error guardando datos');
        }
    }

    setupEventListeners() {
        // Botón de procesar archivos
        const processBtn = document.getElementById('processBtn');
        if (processBtn) {
            processBtn.addEventListener('click', () => this.showFileUpload());
        }

        // Botón de refrescar
        const refreshBtn = document.getElementById('refreshBtn');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => this.refreshData());
        }

        // Input de archivo
        const fileInput = document.getElementById('fileInput');
        if (fileInput) {
            fileInput.addEventListener('change', (e) => this.handleFileUpload(e));
        }
    }

    showFileUpload() {
        const fileInput = document.getElementById('fileInput');
        if (fileInput) {
            fileInput.click();
        }
    }

    async handleFileUpload(event) {
        const file = event.target.files[0];
        if (!file) return;

        if (!file.name.toLowerCase().endsWith('.xlsx')) {
            this.showError('Solo se permiten archivos Excel (.xlsx)');
            return;
        }

        try {
            this.showLoading('Procesando archivo...');
            const result = await this.processExcelFile(file);
            this.hideLoading();
            this.showSuccess(`Archivo procesado: ${result.archivo} - Efectividad: ${result.efectividad.toFixed(2)}%`);
        } catch (error) {
            this.hideLoading();
            console.error('Error procesando archivo:', error);
            this.showError('Error procesando archivo: ' + error.message);
        }
    }

    // Ahora acepta opcionalmente filtros de fecha: datetimeColumn, startISO, endISO
    async processExcelFile(file, datetimeColumn = null, startISO = null, endISO = null) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            
            reader.onload = async (e) => {
                try {
                    const data = new Uint8Array(e.target.result);
                    const workbook = XLSX.read(data, { type: 'array' });
                    
                    // Determinar tipo de proceso basado en el nombre del archivo
                    const proceso = this.determineProcessType(file.name);

                    // Obtener datos de la primera hoja (o la hoja específica para factura)
                    let sheetName;
                    if (proceso === 'Factura electronica') {
                        sheetName = this.config.PROCESS_TYPES['Factura electronica'].sheetName || workbook.SheetNames[0];
                    } else {
                        sheetName = workbook.SheetNames[0];
                    }

                    const sheet = workbook.Sheets[sheetName];
                    let rows = XLSX.utils.sheet_to_json(sheet, { defval: null });
                    console.log('processExcelFile: filas leidas =', rows.length, 'hoja=', sheetName);

                    // Aplicar filtro de fecha si se especificó
                    if (datetimeColumn && (startISO || endISO)) {
                        const start = startISO ? new Date(startISO).getTime() : null;
                        const end = endISO ? new Date(endISO).getTime() : null;
                        rows = rows.filter(r => {
                            const v = r[datetimeColumn];
                            const t = v ? new Date(v).getTime() : NaN;
                            if (isNaN(t)) return false;
                            if (start !== null && t < start) return false;
                            if (end !== null && t > end) return false;
                            return true;
                        });
                        console.log('processExcelFile: filas despues filtro fecha =', rows.length);
                    }

                    // Procesar según el tipo usando los métodos existentes que esperan "workbook" o datos
                    let result;
                    switch (proceso) {
                        case 'Sincronizacion de pedidos':
                            // adaptar processPedidos para recibir array JSON
                            result = await this.processPedidosFromData(rows, file.name);
                            break;
                        case 'Factura electronica':
                            result = await this.processFacturaFromData(rows, file.name);
                            break;
                        default:
                            result = await this.processGenericFromData(rows, file.name);
                    }

                    // Guardar en base de datos (evitar duplicados por nombre de archivo)
                    await this.saveStats(result.archivo, result.efectividad, result.totalRegistros, proceso);

                    resolve(result);
                } catch (error) {
                    reject(error);
                }
            };
            
            reader.onerror = () => reject(new Error('Error leyendo archivo'));
            reader.readAsArrayBuffer(file);
        });
    }

    // Wrappers que adaptan los métodos existentes que usan workbook a recibir arrays JSON
    async processPedidosFromData(rows, filename) {
        // Reusar lógica de processPedidos adaptada para aceptar datos ya parseados
        // Creamos un objeto similar al esperado por processPedidos
        const workbook = { Sheets: { tmp: XLSX.utils.json_to_sheet(rows) }, SheetNames: ['tmp'] };
        return await this.processPedidos(workbook, filename);
    }

    async processFacturaFromData(rows, filename) {
        const workbook = { Sheets: { tmp: XLSX.utils.json_to_sheet(rows) }, SheetNames: ['tmp'] };
        return await this.processFacturaElectronica(workbook, filename);
    }

    async processGenericFromData(rows, filename) {
        const workbook = { Sheets: { tmp: XLSX.utils.json_to_sheet(rows) }, SheetNames: ['tmp'] };
        return await this.processGeneric(workbook, filename);
    }

    determineProcessType(filename) {
        const name = filename.toLowerCase();
        const processTypes = this.config.PROCESS_TYPES;
        
        for (const [type, config] of Object.entries(processTypes)) {
            const keywords = type.toLowerCase().split(' ');
            if (keywords.some(keyword => name.includes(keyword))) {
                return type;
            }
        }
        
        return 'General';
    }

    async processPedidos(workbook, filename) {
        const config = this.config.PROCESS_TYPES['Sincronizacion de pedidos'];
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const data = XLSX.utils.sheet_to_json(sheet);
        
        if (data.length === 0) {
            throw new Error('El archivo está vacío');
        }

        // Verificar columnas requeridas
        const requiredCols = config.requiredColumns;
        const missingCols = requiredCols.filter(col => !data[0].hasOwnProperty(col));
        if (missingCols.length > 0) {
            throw new Error(`Faltan columnas requeridas: ${missingCols.join(', ')}`);
        }

        // Procesar datos
        const pedidos = new Map();
        
        data.forEach(row => {
            const pedidoNum = row[config.groupBy];
            const estado = String(row[config.requiredColumns[1]]).trim().toLowerCase();
            const exitoso = estado === config.successValue;
            
            if (!pedidos.has(pedidoNum)) {
                pedidos.set(pedidoNum, { exitoso: false, total: 0 });
            }
            
            const pedido = pedidos.get(pedidoNum);
            pedido.total++;
            if (exitoso) pedido.exitoso = true;
        });

        const totalPedidos = pedidos.size;
        const pedidosExitosos = Array.from(pedidos.values()).filter(p => p.exitoso).length;
        const efectividad = totalPedidos > 0 ? (pedidosExitosos / totalPedidos) * 100 : 0;

        return {
            archivo: filename,
            efectividad: efectividad,
            totalRegistros: totalPedidos
        };
    }

    async processFacturaElectronica(workbook, filename) {
        const config = this.config.PROCESS_TYPES['Factura electronica'];
        
        // Buscar hoja específica o usar la primera
        const sheetName = config.sheetName || workbook.SheetNames[0];
        const facturasSheet = workbook.Sheets[sheetName] || workbook.Sheets[workbook.SheetNames[0]];
        const data = XLSX.utils.sheet_to_json(facturasSheet);
        
        if (data.length === 0) {
            throw new Error('El archivo está vacío');
        }

        // Verificar columnas requeridas
        const requiredCols = config.requiredColumns;
        const missingCols = requiredCols.filter(col => !data[0].hasOwnProperty(col));
        if (missingCols.length > 0) {
            throw new Error(`Faltan columnas requeridas: ${missingCols.join(', ')}`);
        }

        // Procesar datos
        const facturas = new Map();
        
        data.forEach(row => {
            const factura = row[config.groupBy];
            const estado = String(row[config.requiredColumns[1]]).trim().toLowerCase();
            const exitoso = estado === config.successValue;
            
            if (!facturas.has(factura)) {
                facturas.set(factura, { exitoso: false, total: 0 });
            }
            
            const facturaData = facturas.get(factura);
            facturaData.total++;
            if (exitoso) facturaData.exitoso = true;
        });

        const totalFacturas = facturas.size;
        const facturasExitosas = Array.from(facturas.values()).filter(f => f.exitoso).length;
        const efectividad = totalFacturas > 0 ? (facturasExitosas / totalFacturas) * 100 : 0;

        return {
            archivo: filename,
            efectividad: efectividad,
            totalRegistros: totalFacturas
        };
    }

    async processGeneric(workbook, filename) {
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const data = XLSX.utils.sheet_to_json(sheet);
        
        return {
            archivo: filename,
            efectividad: 0, // Placeholder
            totalRegistros: data.length
        };
    }

    async refreshData() {
        this.showLoading('Cargando datos...');
        await this.loadStats();
        this.renderStats();
        this.hideLoading();
    }

    renderStats() {
        const container = document.getElementById('statsContainer');
        if (!container) return;

        if (this.stats.length === 0) {
            container.innerHTML = '<p>No hay datos disponibles</p>';
            return;
        }
        // Renderizar como tabla (filas)
        let html = `
            <table class="stats-table" style="width:100%; border-collapse: collapse;">
                <thead>
                    <tr>
                        <th style="text-align:left; padding:8px; border-bottom:1px solid #ddd;">Archivo</th>
                        <th style="text-align:left; padding:8px; border-bottom:1px solid #ddd;">Proceso</th>
                        <th style="text-align:right; padding:8px; border-bottom:1px solid #ddd;">Efectividad</th>
                        <th style="text-align:right; padding:8px; border-bottom:1px solid #ddd;">Total registros</th>
                        <th style="text-align:left; padding:8px; border-bottom:1px solid #ddd;">Fecha</th>
                    </tr>
                </thead>
                <tbody>
        `;

        this.stats.forEach(stat => {
            html += `
                <tr>
                    <td style="padding:8px; border-bottom:1px solid #f0f0f0;">${this.escapeHtml(stat.archivo)}</td>
                    <td style="padding:8px; border-bottom:1px solid #f0f0f0;">${this.escapeHtml(stat.proceso)}</td>
                    <td style="padding:8px; text-align:right; border-bottom:1px solid #f0f0f0;">${this.renderStatusChip(stat.efectividad)}</td>
                    <td style="padding:8px; text-align:right; border-bottom:1px solid #f0f0f0;">${this.escapeHtml(stat.totalRegistros ?? stat.total_registros ?? '')}</td>
                    <td style="padding:8px; border-bottom:1px solid #f0f0f0;">${this.escapeHtml(new Date(stat.fecha_proceso).toLocaleString())}</td>
                </tr>
            `;
        });

        html += `</tbody></table>`;
        container.innerHTML = html;
    }

    // Helper que retorna un pequeño chip HTML representando la efectividad
    renderStatusChip(value) {
        const v = (typeof value === 'number') ? value : (parseFloat(value) || 0);
        const label = isNaN(v) ? '' : v.toFixed(2) + '%';

        // Escala solicitada:
        // - < 25% : rojo
        // - 25% - 60% : naranja
        // - 60% - 95% : amarillo
        // - >= 95% : verde
        let bg = '#fee2e2'; // rojo claro
        let color = '#c53030';

        if (v >= 95) {
            bg = '#c6f6d5'; color = '#22543d'; // verde
        } else if (v >= 60) {
            bg = '#fef9c3'; color = '#92400e'; // amarillo
        } else if (v >= 25) {
            bg = '#ffedd5'; color = '#c05621'; // naranja
        }

        // Estilos inline para evitar depender de CSS adicional
        const style = `display:inline-block; padding:4px 10px; border-radius:16px; background:${bg}; color:${color}; font-weight:600;`;
        return `<span style="${style}">${label}</span>`;
    }

    // Escapar texto para insertar en innerHTML y prevenir XSS
    escapeHtml(text) {
        if (text === undefined || text === null) return '';
        return String(text)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    showLoading(message) {
        const loading = document.getElementById('loading');
        if (loading) {
            loading.textContent = message;
            loading.style.display = 'block';
        }
    }

    hideLoading() {
        const loading = document.getElementById('loading');
        if (loading) {
            loading.style.display = 'none';
        }
    }

    showError(message) {
        this.showNotification(message, 'error');
    }

    showSuccess(message) {
        this.showNotification(message, 'success');
    }

    showNotification(message, type) {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        const duration = this.config.UI.NOTIFICATION_DURATION;
        setTimeout(() => {
            notification.remove();
        }, duration);
    }

    close() {
        // No hay conexiones que cerrar en esta implementación
        // localStorage se mantiene automáticamente
        console.log('Aplicación cerrada');
    }
}

// Inicializar aplicación cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    window.italcolApp = new ITALCOLApp();
});
