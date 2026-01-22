-- Create computers table
CREATE TABLE public.computers (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    serial_number TEXT NOT NULL UNIQUE,
    department TEXT NOT NULL,
    registration_date DATE NOT NULL DEFAULT CURRENT_DATE,
    warranty_end_date DATE NOT NULL,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'repair', 'retired')),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.computers ENABLE ROW LEVEL SECURITY;

-- Create policy for public read access (anyone can view computers)
CREATE POLICY "Anyone can view computers" 
ON public.computers 
FOR SELECT 
USING (true);

-- Create policy for authenticated users to insert
CREATE POLICY "Authenticated users can insert computers" 
ON public.computers 
FOR INSERT 
TO authenticated
WITH CHECK (true);

-- Create policy for authenticated users to update
CREATE POLICY "Authenticated users can update computers" 
ON public.computers 
FOR UPDATE 
TO authenticated
USING (true);

-- Create policy for authenticated users to delete
CREATE POLICY "Authenticated users can delete computers" 
ON public.computers 
FOR DELETE 
TO authenticated
USING (true);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_computers_updated_at
BEFORE UPDATE ON public.computers
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert initial data from mock data
INSERT INTO public.computers (name, serial_number, department, registration_date, warranty_end_date, status) VALUES
('PC-SALES-001', 'DELL-XPS15-2024-ABC123', 'ฝ่ายขาย', '2024-01-15', '2027-01-15', 'active'),
('PC-SALES-002', 'HP-ELITEBOOK-2023-DEF456', 'ฝ่ายขาย', '2023-06-20', '2026-02-10', 'active'),
('PC-ACC-001', 'LENOVO-T14-2022-GHI789', 'บัญชี', '2022-03-10', '2025-03-10', 'active'),
('PC-ACC-002', 'DELL-OPT7090-2024-JKL012', 'บัญชี', '2024-02-28', '2027-02-28', 'active'),
('PC-IT-001', 'ASUS-ROG-2023-MNO345', 'IT', '2023-09-05', '2026-09-05', 'active'),
('PC-IT-002', 'HP-ZBOOK-2021-PQR678', 'IT', '2021-11-12', '2024-11-12', 'repair'),
('PC-HR-001', 'DELL-LAT5520-2023-STU901', 'HR', '2023-04-18', '2026-04-18', 'active'),
('PC-HR-002', 'LENOVO-X1C-2020-VWX234', 'HR', '2020-08-25', '2023-08-25', 'retired'),
('PC-MGR-001', 'APPLE-MBP16-2024-YZA567', 'ผู้บริหาร', '2024-03-01', '2027-03-01', 'active'),
('PC-MGR-002', 'DELL-PREC5570-2023-BCD890', 'ผู้บริหาร', '2023-07-15', '2026-07-15', 'active'),
('PC-SALES-003', 'HP-PROBOOK-2022-EFG123', 'ฝ่ายขาย', '2022-12-01', '2025-12-01', 'active'),
('PC-SVC-001', 'LENOVO-E15-2024-HIJ456', 'ศูนย์บริการ', '2024-01-20', '2027-01-20', 'active'),
('PC-SVC-002', 'DELL-INS3520-2021-KLM789', 'ศูนย์บริการ', '2021-05-30', '2024-05-30', 'repair'),
('PC-PARTS-001', 'ASUS-VIVOBOOK-2023-NOP012', 'อะไหล่', '2023-10-10', '2026-10-10', 'active'),
('PC-PARTS-002', 'HP-PAVILION-2019-QRS345', 'อะไหล่', '2019-06-15', '2022-06-15', 'retired');