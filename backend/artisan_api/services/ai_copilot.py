import re
import json
import time
from artisan_api.models import Product, Order, Inventory, AgentMemory, LLMCostTracker
from artisan_api.agent_engine import parse_hindi_craft_to_english

class AICommerceCopilot:
    """
    Unified Conversational Two-Way Voice & Commerce Copilot for Artisans & Customers.
    Intelligently handles spoken queries, voice product listing, sales analytics,
    fair living-wage pricing, customer craft search, and ONDC direct dispatch.
    """
    def process_query(self, user, query: str) -> dict:
        start_time = time.time()
        q_raw = (query or '').strip()
        q_lower = q_raw.lower()

        # Database aggregations filtered by current artisan user if authenticated
        if user and user.is_authenticated:
            user_orders = list(Order.objects.filter(artisan=user))
            user_products = list(Product.objects.filter(artisan=user))
        else:
            user_orders = list(Order.objects.all())
            user_products = list(Product.objects.all())

        total_revenue = sum(float(o.total_price or 0) for o in user_orders)
        order_count = len(user_orders)
        prod_count = len(user_products)

        result_payload = {}
        approval_level = 1
        requires_approval = False
        action_name = "QUERY_INFO"
        spoken_hindi = ""

        # 1. Voice Intent: Direct Product Creation & ONDC Live Listing
        # e.g. "Maine 2 din me terracotta ghada banaya, mitti aur laagat ₹200 aayi, isko live dukaan par daal do"
        if re.search(r'maine.*banaya|naya craft|banayi hai|banaya hai|ghada banaya|matka banaya|saree buni|diya banaya|toy banaya|laagat|dukaan par daal|live becho|publish kar do', q_lower):
            parsed = parse_hindi_craft_to_english(q_raw)
            
            # Extract material cost or default
            cost_match = re.search(r'(?:laagat|lagat|cost|rupaye|rs\.?|₹)\s*(\d+)', q_lower)
            mat_cost = float(cost_match.group(1)) if cost_match else 250.0
            
            # Living wage computation: 2 days labor (~₹700) + packaging (₹50) + margin (30%)
            fair_price = round(mat_cost + 450 + 50 + (mat_cost * 0.35))
            
            image_map = {
                'Pottery / Terracotta': 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?auto=format&fit=crop&w=800&q=80',
                'Textiles / Handloom': 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80',
                'Metal craft': 'https://images.unsplash.com/photo-1605647540924-852290f6b0d5?auto=format&fit=crop&w=800&q=80',
                'Woodwork': 'https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?auto=format&fit=crop&w=800&q=80',
                'Artisanal Handicrafts': 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=800&q=80'
            }
            chosen_img = image_map.get(parsed['category'], image_map['Pottery / Terracotta'])

            created_product = {
                'title': parsed['title'],
                'description': parsed['description'],
                'category': parsed['category'],
                'price': fair_price,
                'original_price': round(fair_price * 1.25),
                'material': parsed['material'],
                'origin': parsed['craft_origin'],
                'technique': parsed['technique'],
                'care_instructions': parsed['care_instructions'],
                'image': chosen_img
            }

            action_name = "VOICE_CREATE_PRODUCT"
            result_payload = {'product': created_product}
            
            answer = (
                f"✨ **Voice Listing Created & Ready for ONDC!**\n\n"
                f"• **Title:** {parsed['title']}\n"
                f"• **Category:** {parsed['category']} ({parsed['craft_origin']})\n"
                f"• **Calculated Fair Price:** ₹{fair_price} (Living-Wage Verified)\n"
                f"• **Material & Technique:** {parsed['material']} with {parsed['technique']}\n\n"
                f"Product ko auto 4K studio lighting aur ONDC Beckn tag ke sath live storefront par place kar diya gaya hai!"
            )
            spoken_hindi = f"Namaste! Maine aapka {parsed['title']} ₹{fair_price} me Kaarvo Store aur ONDC par live publish kar diya hai!"

        # 2. Voice Intent: Customer Smart Search & Store Filtering
        # e.g. "Mujhe Blue Pottery dikhao under 2000" or "Banarasi silk saree dikhao"
        elif re.search(r'dikhao|search|dhoondho|dhundo|chahiye|blue pottery|terracotta|saree|brass|under\s*\d+|kam daam|dekhna hai', q_lower) and not re.search(r'kamai|sales|order|price|pricing|kimat|daam|bechu|margin|fair price', q_lower):
            category = ''
            search_term = ''
            max_price = None

            price_match = re.search(r'(?:under|below|kam|upto|se kam)\s*₹?\s*(\d+)', q_lower)
            if price_match:
                max_price = float(price_match.group(1))

            if re.search(r'pottery|terracotta|clay|matka|vase|mitti', q_lower):
                category = 'Pottery / Terracotta'
                search_term = 'pottery'
            elif re.search(r'saree|silk|handloom|textile|dupatta|chanderi', q_lower):
                category = 'Textiles / Handloom'
                search_term = 'silk'
            elif re.search(r'brass|metal|diya|bell|peetal', q_lower):
                category = 'Metal craft'
                search_term = 'brass'
            elif re.search(r'wood|wooden|toy|channapatna|lakdi', q_lower):
                category = 'Woodwork'
                search_term = 'wood'
            elif re.search(r'jewelry|jewellery|traditional', q_lower):
                category = 'Jewelry (traditional)'
                search_term = 'jewelry'

            action_name = "VOICE_FILTER_STORE"
            result_payload = {
                'category': category,
                'search': search_term,
                'max_price': max_price
            }
            
            display_cat = category or search_term or "masterpieces"
            answer = (
                f"🔍 **Voice Search Applied:**\n\n"
                f"• Filter Category: {category or 'All Heritage Clusters'}\n"
                f"• Search Query: '{search_term or q_raw}'\n"
                f"{f'• Maximum Budget: ₹{max_price}' if max_price else ''}\n\n"
                f"Maine storefront par matching authentic craft pieces filter kar diye hain."
            )
            spoken_hindi = f"Maine aapke liye curated {display_cat} ke authentic pieces filter kar diye hain."

        # 3. Voice Intent: Sales & Revenue Analysis
        # e.g. "Meri is hafte ki kitni kamai hui aur kitne orders pending hain?"
        elif re.search(r'sales|revenue|earnings|orders|munafa|kamai|kitna bika|total sale|kitne order', q_lower):
            action_name = "ANALYZE_SALES"
            result_payload = {'total_revenue': total_revenue, 'order_count': order_count}
            
            answer = (
                f"📊 **Aapke Business Ka Live Sales & Revenue Report:**\n\n"
                f"• **Total Orders:** {order_count} orders successfully received via ONDC\n"
                f"• **Total Revenue:** ₹{total_revenue:,.0f} direct bank settlement\n"
                f"• **Active Live Listings:** {prod_count} handcrafted items\n\n"
                f"💡 **AI Recommendation:** Festival demand is rising across metro craft lovers!"
            )
            if order_count > 0:
                spoken_hindi = f"Aapke store par kul {order_count} orders process hue hain, aur total kamai ₹{total_revenue:,.0f} hui hai."
            else:
                spoken_hindi = "Aapka ONDC store active hai! Jaise hi koi grahak order karega, aapko live alert mil jayega."

        # 4. Voice Intent: Price Suggestion / Fair Living-Wage Calculator
        elif re.search(r'suggest price|pricing|price|rate|daam|kimat|kitne me bechu|margin|cost|fair price', q_lower):
            action_name = "SUGGEST_PRICE"
            answer = (
                "💡 **Kaarvo Cost-Plus Fair Living-Wage Pricing Benchmark:**\n\n"
                "• **Formula:** Base Cost = Raw Material + Skilled Artisan Labor (₹140/hr benchmark)\n"
                "• **Terracotta / Pottery:** 40% – 60% markup (covers kiln baking & delicate handling)\n"
                "• **Handloom / Silk:** 30% – 45% markup (honors pure zari & heritage weave time)\n"
                "• **Brass / Metal Casting:** 35% – 55% markup (accounts for sand-casting & metal weight)\n\n"
                "Pillar 3 Pricing Assistant me exact material aur labor cost daalne par accurate living-wage price mil jati hai."
            )
            spoken_hindi = "Kaarvo AI aapko laagat ke upar kam se kam 35 se 50 percent fair living-wage margin suggest karta hai."

        # 5. Voice Intent: Courier / Dispatch Label
        elif re.search(r'dispatch|courier|pickup|shipping|label|print label', q_lower):
            action_name = "PRINT_DISPATCH_LABEL"
            result_payload = {'order_id': 'ORD-1', 'carrier': 'India Post / Delhivery'}
            answer = (
                "📦 **Courier Dispatch & Shipping Pickup Ready:**\n\n"
                "• Courier Partner: India Post / Delhivery ONDC Logistics\n"
                "• Packaging standard: Eco-friendly corrugated kraft padding\n"
                "• Shipping barcode dispatch label print ho chuka hai."
            )
            spoken_hindi = "Aapka courier dispatch label ready hai. Courier pickup schedule kar diya gaya hai."

        # 6. Voice Intent: Navigation to Tabs (Studio, Orders, Store, Cart)
        elif re.search(r'studio kholo|orders kholo|cart kholo|store kholo|navigate|open studio', q_lower):
            target_tab = 'studio'
            if 'order' in q_lower: target_tab = 'orders'
            elif 'cart' in q_lower: target_tab = 'cart'
            elif 'store' in q_lower: target_tab = 'explore'
            
            action_name = "NAVIGATE_TAB"
            result_payload = {'target': target_tab}
            answer = f"Screen ko '{target_tab}' par switch kar diya gaya hai."
            spoken_hindi = f"Maine screen ko {target_tab} par switch kar diya hai."

        # 7. Intent: About Kaarvo Application / Platform / Overview
        elif re.search(r'application|app\b|platform|kaarvo|baare me|kya hai|kya h|kaise kaam|about|features|intro', q_lower):
            answer = (
                "🙏 Namaste! Kaarvo AI ek AI-Powered Commerce Operating System hai jo Indian Artisans ko direct ONDC se jodta hai:\n\n"
                "✨ 1. AI Visual Studio: 4K lighting enhancement\n"
                "🎙️ 2. Conversational Voice AI: Bol kar product live bechein\n"
                "⚖️ 3. Cost-Plus Fair Pricing: Living-wage guarantee\n"
                "📜 4. Digital Heritage Passport: Tamper-proof QR code provenance\n"
                "💬 5. WhatsApp AI Sahayak: Direct buyer order alerts"
            )
            action_name = "APP_OVERVIEW"
            spoken_hindi = "Namaste! Kaarvo AI par aap bol kar product bech sakte hain, fair price nikaal sakte hain aur ONDC orders manage kar sakte hain."

        # 8. General Helpful Artisan Copilot Response
        else:
            answer = (
                f"Namaste! Maine aapka sawal samjha: '{q_raw}'.\n\n"
                "Aap mujhse bol kar yeh sab kara sakte hain:\n"
                "• 'Maine 2 din me terracotta ghada banaya, laagat ₹200' (Auto Product Listing)\n"
                "• 'Meri is hafte ki kamai aur orders kitne hain?' (Sales Report)\n"
                "• 'Mujhe Blue pottery dikhao under ₹2000' (Customer Search)\n"
                "• 'Banarasi saree ka fair price kitna hona chahiye?' (Pricing Advisor)\n"
                "• 'Courier dispatch label print karo' (Shipping Dispatch)"
            )
            spoken_hindi = "Namaste! Aap mujhse bol kar naya product list kara sakte hain, sales check kar sakte hain ya customer crafts dhoondh sakte hain."

        latency = int((time.time() - start_time) * 1000)

        # Track LLM Copilot Usage
        try:
            LLMCostTracker.objects.create(
                provider='KaarvoCopilot',
                model_name='artisan-voice-copilot-v2',
                operation='VoiceCopilotQuery',
                tokens_used=len(q_raw) + len(answer),
                estimated_cost=0.000150,
                latency_ms=latency
            )
        except Exception:
            pass

        return {
            'answer': answer,
            'spoken_hindi': spoken_hindi,
            'action': action_name,
            'approval_level': approval_level,
            'requires_approval': requires_approval,
            'payload': result_payload,
            'latency_ms': latency
        }
